from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
import json
import os
import urllib.request

from fli.models import Airport, FlightSearchFilters, FlightSegment, MaxStops, PassengerInfo, SeatType, SortBy
from fli.search import SearchFlights

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")


def cache_get(key):
    if not UPSTASH_URL or not UPSTASH_TOKEN:
        return None
    try:
        req = urllib.request.Request(
            f"{UPSTASH_URL}/get/{key}",
            headers={"Authorization": f"Bearer {UPSTASH_TOKEN}"},
        )
        with urllib.request.urlopen(req, timeout=2) as r:
            data = json.loads(r.read())
            return json.loads(data["result"]) if data.get("result") else None
    except Exception:
        return None


def cache_set(key, value, ttl=3600):
    if not UPSTASH_URL or not UPSTASH_TOKEN:
        return
    try:
        body = json.dumps(["SET", key, json.dumps(value), "EX", ttl]).encode()
        req = urllib.request.Request(
            f"{UPSTASH_URL}/pipeline",
            data=body,
            headers={
                "Authorization": f"Bearer {UPSTASH_TOKEN}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        urllib.request.urlopen(req, timeout=2)
    except Exception:
        pass


DESTINATIONS = [
    "ACC", "ADD", "ADL", "AKL", "ALA", "AMD",
    "AMQ", "AMS", "AOR", "ARN", "ATH", "ATL",
    "AUH", "BAH", "BCN", "BDJ", "BDO", "BEJ",
    "BER", "BIK", "BKI", "BKK", "BKS", "BLR",
    "BMU", "BNE", "BOG", "BOM", "BOS", "BPN",
    "BRU", "BTH", "BUD", "BUW", "BWN", "CAI",
    "CAN", "CCU", "CDG", "CEB", "CGK", "CHC",
    "CJU", "CMB", "CMN", "CNS", "CNX", "COK",
    "CPH", "CPT", "CRK", "CTS", "CTU", "CUN",
    "CXR", "DAC", "DAD", "DEL", "DEN", "DFW",
    "DIL", "DJB", "DJJ", "DME", "DMK", "DMM",
    "DOH", "DPS", "DRW", "DUB", "DVO", "DWC",
    "DXB", "ENE", "EVN", "EWR", "EZE", "FCO",
    "FRA", "FUK", "GIG", "GLX", "GMP", "GRU",
    "GTO", "GVA", "GYD", "HAN", "HDY", "HEL",
    "HGH", "HKG", "HKT", "HLP", "HND", "HYD",
    "IAD", "IAH", "ICN", "IKA", "ILO", "IPH",
    "IST", "ITM", "JED", "JFK", "JHB", "JNB",
    "JOG", "KAZ", "KBR", "KBV", "KCH", "KDI",
    "KHH", "KIX", "KJT", "KMG", "KNO", "KOE",
    "KOJ", "KTG", "KTM", "KUL", "KWI", "LAH",
    "LAS", "LAX", "LBJ", "LGK", "LGW", "LHR",
    "LIM", "LIS", "LOP", "LOS", "LPQ", "LUV",
    "LUW", "MAA", "MAD", "MAN", "MCO", "MCT",
    "MDC", "MDL", "MED", "MEL", "MEX", "MFM",
    "MIA", "MKQ", "MKW", "MLE", "MLG", "MNL",
    "MOF", "MRU", "MUC", "MXP", "NAM", "NAN",
    "NBO", "NBX", "NGO", "NQZ", "NRE", "NRT",
    "OOL", "ORD", "ORY", "OSL", "OTI", "PDG",
    "PEK", "PEN", "PER", "PGK", "PKN", "PKU",
    "PKX", "PKY", "PLM", "PLW", "PNK", "POM",
    "PPS", "PQC", "PRG", "PSU", "PUS", "PVG",
    "RGN", "RMQ", "RTG", "RUH", "SAN", "SAW",
    "SCL", "SDJ", "SEA", "SEZ", "SFO", "SGN",
    "SHA", "SHJ", "SIN", "SMQ", "SOC", "SOQ",
    "SQN", "SRG", "SUB", "SVO", "SWQ", "SXK",
    "SYD", "SZB", "SZX", "TAS", "TBS", "TFU",
    "TGG", "THR", "TIM", "TJQ", "TMC", "TPE",
    "TRK", "TTE", "UPG", "URT", "USM", "UTP",
    "VCA", "VCE", "VIE", "VTE", "WAW", "WBA",
    "WGP", "WLG", "WMX", "XMN", "XSP", "YIA",
    "YUL", "YVR", "YYZ", "ZAM", "ZQN", "ZRH",
    "ZRI",
]


def search_destination(origin_airport, destination_code, travel_date):
    try:
        dest_airport = Airport[destination_code]
        filters = FlightSearchFilters(
            passenger_info=PassengerInfo(adults=1),
            flight_segments=[
                FlightSegment(
                    departure_airport=[[origin_airport, 0]],
                    arrival_airport=[[dest_airport, 0]],
                    travel_date=travel_date,
                )
            ],
            seat_type=SeatType.ECONOMY,
            stops=MaxStops.ANY,
            sort_by=SortBy.CHEAPEST,
        )
        search = SearchFlights()
        flights = search.search(filters)
        if not flights:
            return None
        cheapest = flights[0]
        return {
            "destination": destination_code,
            "price": cheapest.price,
            "airline": cheapest.legs[0].airline.value,
        }
    except Exception:
        return None


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        origin = params.get("origin", [None])[0]
        max_price_str = params.get("maxPrice", [None])[0]

        if not origin or not max_price_str:
            self._respond(400, {"error": "Missing required params: origin, maxPrice"})
            return

        try:
            origin_airport = Airport[origin.upper()]
        except KeyError:
            self._respond(400, {"error": f"Unknown airport code: {origin}"})
            return

        try:
            max_price_idr = int(max_price_str)
        except ValueError:
            self._respond(400, {"error": "maxPrice must be an integer"})
            return

        travel_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        date_pref = params.get("datePref", ["flexible"])[0]
        if date_pref and date_pref != "flexible":
            month_map = {"january":1,"february":2,"march":3,"april":4,"may":5,"june":6,
                         "july":7,"august":8,"september":9,"october":10,"november":11,"december":12}
            if date_pref in month_map:
                target_month = month_map[date_pref]
                now = datetime.now()
                year = now.year if target_month >= now.month else now.year + 1
                travel_date = datetime(year, target_month, 15).strftime("%Y-%m-%d")
        cache_key = f"radius:v4:{origin.upper()}:{max_price_idr}:{travel_date}"

        cached = cache_get(cache_key)
        if cached is not None and len(cached) > 0:
            self._respond(200, cached)
            return

        results = []
        origin_code = origin_airport.name
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {
                executor.submit(search_destination, origin_airport, dest, travel_date): dest
                for dest in DESTINATIONS
                if dest != origin_code
            }
            for future in as_completed(futures):
                try:
                    result = future.result(timeout=8)
                except Exception:
                    continue
                if result is None:
                    continue
                raw_price = result["price"]
                # fli returns prices in different units across versions:
                # - Older versions return compressed values (e.g. 53 = ~$53 USD)
                # - Newer versions return raw IDR (e.g. 916,369)
                # Detect and normalize: anything < 100,000 needs conversion
                # Skip zero/null prices (invalid results)
                if not raw_price or raw_price <= 0:
                    continue
                if raw_price < 100_000:
                    price_idr = int(raw_price * 16_200)
                else:
                    price_idr = int(raw_price)
                if price_idr <= max_price_idr:
                    results.append({
                        "destination": result["destination"],
                        "price": {"total": str(price_idr)},
                        "departureDate": travel_date,
                        "airline": result["airline"],
                    })

        results.sort(key=lambda x: int(x["price"]["total"]))
        if results:
            cache_set(cache_key, results)
        self._respond(200, results)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, status, data):
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "public, s-maxage=3600, max-age=600, stale-while-revalidate=86400")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass
