from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
import json

from fli.models import Airport, FlightSearchFilters, FlightSegment, MaxStops, PassengerInfo, SeatType, SortBy
from fli.search import SearchFlights

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
            "price": cheapest.price,  # fli returns IDR directly for Indonesian departures
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
                price_idr = int(result["price"])
                if price_idr <= max_price_idr:
                    results.append({
                        "destination": result["destination"],
                        "price": {"total": str(price_idr)},
                        "departureDate": travel_date,
                        "airline": result["airline"],
                    })

        results.sort(key=lambda x: int(x["price"]["total"]))
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
