# **App Name**: Lima Safe Route

## Core Features:

- Interactive Map Display: Display an interactive map of Lima, highlighting districts as nodes.
- District Selection: Allow users to select origin and destination districts on the map.
- Path Calculation: Implement Dijkstra's algorithm to calculate the safest and shortest path, considering both distance and risk.
- Weighted Risk Assessment: Use a weighted formula that combines distance and danger (user adjustable weights) to calculate the total risk factor for each path.
- Route Visualization: Display the calculated path on the map, visually distinguishing safer vs less safe routes. Color coding to represent levels of danger on each segment of the route.
- Distance and Risk Summary: Show the path's total distance and a combined risk score calculated by the algorithm.
- Dynamic Risk Tool: AI tool that reviews and adjusts the weights based on the current news cycle related to public safety and incidents, to provide better risk estimations. 

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and security.
- Background color: Light gray (#F5F5F5) for a clean and unobtrusive backdrop.
- Accent color: Bright orange (#FF9800) to highlight interactive elements and alerts.
- Body and headline font: 'Inter', a sans-serif, to ensure readability and a modern feel.
- Code font: 'Source Code Pro' for displaying technical information and numerical data.
- Use clear and recognizable icons to represent different levels of safety, points of interest, and warnings.
- Prioritize clarity and ease of use in the layout, ensuring that the map is central and all information is easily accessible.