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
    "DPS", "SUB", "KNO", "LBJ", "LOP", "JOG", "BPN", "PLM", "MDC", "UPG",
    "SIN", "KUL", "BKK", "NRT", "ICN", "HKG", "SGN", "MNL", "SYD", "LHR", "JFK",
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
            "price": cheapest.price,  # raw price (format depends on fli version — normalized later)
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
        cache_key = f"radius:v2:{origin.upper()}:{max_price_idr}:{travel_date}"

        cached = cache_get(cache_key)
        if cached is not None:
            self._respond(200, cached)
            return

        results = []
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = {
                executor.submit(search_destination, origin_airport, dest, travel_date): dest
                for dest in DESTINATIONS
            }
            for future in as_completed(futures):
                result = future.result()
                if result is None:
                    continue
                raw_price = result["price"]
                # fli returns prices in different units across versions:
                # - Older versions return compressed values (e.g. 53 = ~$53 USD)
                # - Newer versions return raw IDR (e.g. 916,369)
                # Detect and normalize: anything < 100,000 needs conversion
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
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass
