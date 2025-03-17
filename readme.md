# ELD Trip Planner - Backend and Frontend

The ELD Trip Planner is a comprehensive application designed to assist truck drivers and fleet managers in planning trips while complying with Hours of Service (HOS) regulations. The application includes a Django REST Framework (DRF) backend for trip planning, route calculation, and ELD log generation, and a React frontend for visualizing trip details, routes, and logs.

## Features

**Backend (Django REST Framework)**

*   REST API for trip planning and management
*   Route Calculation with mandatory rest and fuel stops based on HOS regulations
*   ELD Log Generation compliant with HOS rules
*   Geocoding for converting addresses to latitude/longitude coordinates
*   Database Models for trips, route points, and ELD logs
*   Custom Services for route calculation and ELD log generation

**Frontend (React)**

*   Interactive Map for visualizing the trip route with markers for stops
*   Trip Summary with key metrics (distance, duration, stops, etc.)
*   ELD Logs display with detailed driving, on-duty, off-duty, and sleeper berth periods
*   Responsive Design using Material-UI components
*   Trip History for viewing past trips

## Project Structure

**Backend**

*   `core/`: Main Django project configuration
    *   `settings.py`: Django settings with CORS, REST framework, and database configuration
    *   `urls.py`: API endpoint routing
*   `trip_planner/`: Django app for trip management
    *   `models.py`: Database models for trips, route points, and ELD logs
    *   `views.py`: API views for trip creation, route, and log retrieval
    *   `serializers.py`: Serializers for API data representation
    *   `services.py`: Business logic for route calculation and ELD log generation

**Frontend**

*   **React Components:**
    *   `ELDLogs.js`: Displays ELD logs for a trip
    *   `Header.js`: Navigation bar with links to new trips and trip history
    *   `RouteMap.js`: Interactive map with route visualization
    *   `TripList.js`: Displays a list of past trips
    *   `TripSummary.js`: Provides a detailed summary of a trip

## Setup Instructions

**Backend Setup**

1.  **Create a Virtual Environment:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory with the following variables:

    ```
    SECRET_KEY=your-secret-key
    DEBUG=True
    ```

4.  **Run Migrations:**

    ```bash
    python manage.py migrate
    ```

5.  **Create a Superuser (Optional):**

    ```bash
    python manage.py createsuperuser
    ```

6.  **Run the Development Server:**

    ```bash
    python manage.py runserver
    ```

**Frontend Setup**

1.  **Install Node.js Dependencies:**
    Navigate to the `frontend/` directory and run:

    ```bash
    npm install
    ```

2.  **Start the Development Server:**

    ```bash
    npm start
    ```

## API Endpoints

**Trip Management**

*   `POST /api/trips/`: Create a new trip

    ```json
    {
      "current_location": "Los Angeles, CA",
      "pickup_location": "Phoenix, AZ",
      "dropoff_location": "Dallas, TX",
      "current_cycle_hours": 2.5
    }
    ```

*   `GET /api/trips/`: List all trips

*   `GET /api/trips/{id}/`: Get details of a specific trip

*   `GET /api/trips/{id}/route/`: Get route details for a trip

*   `GET /api/trips/{id}/logs/`: Get ELD logs for a trip

## Example API Usage

**Create a Trip**

```bash
curl -X POST http://localhost:8000/api/trips/ \
  -H "Content-Type: application/json" \
  -d '{
    "current_location": "Los Angeles, CA",
    "pickup_location": "Phoenix, AZ",
    "dropoff_location": "Dallas, TX",
    "current_cycle_hours": 2.5
  }'


**Get Trip Details**

```bash
curl -X GET http://localhost:8000/api/trips/{id}/
```

**Get Route Details**

```bash
curl -X GET http://localhost:8000/api/trips/{id}/route/
```

**Get ELD Logs**

```bash
curl -X GET http://localhost:8000/api/trips/{id}/logs/
```

## Deployment

**Backend**

*   Set `DEBUG=False` in your `.env` file for production.
*   Configure `ALLOWED_HOSTS` in `settings.py` to include your domain.
*   Use a production-ready web server like Gunicorn or uWSGI.
*   Serve static files using Whitenoise or a CDN.

**Frontend**

*   Build the React app for production:

    ```bash
    npm run build
    ```

*   Serve the `build/` directory using a web server like Nginx or Apache.

## Technologies Used

**Backend**

*   Django: Web framework for building the backend
*   Django REST Framework (DRF): For building RESTful APIs
*   SQLite: Default database (can be replaced with PostgreSQL or MySQL for production)
*   Geopy: For geocoding and distance calculations
*   CORS Headers: For handling cross-origin requests

**Frontend**

*   React: JavaScript library for building the user interface
*   Material-UI: Component library for responsive and modern UI
*   Leaflet: For interactive maps
*   React Router: For client-side routing

## Contributing

1.  Fork the repository.
2.  Create a new branch for your feature or bugfix.
3.  Commit your changes and push to the branch.
4.  Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

*   Django and React communities for their excellent documentation and resources.
*   Material-UI for providing a robust component library.
*   Leaflet for making map integration seamless.

For any questions or issues, please open an issue on the GitHub repository.
```