Parking Lot API version 1.0
 
- allows for CRUD operations on cars, users, parking lots and spots.
- provides APIs for computing cost on exit, identifying parked cars in a parking lot, car in a parking spot, available parking spots (in a parking lot, city B, or near postal code)
- needs better mongoose validation of input, e.g. checking for case insensitivity in a field, checking if the user has permission to create a car, checking if timeIn for a car contains time as well not just date, etc.   
- needs proper error handling, returning granular error message, e.g. on validation 
- needs refactoring to have a proper middleware (for doing validation) and endpoints which act on Object Oriented classes (prototype) for models, controllers
- needs API for determining available parking spots for a given size (and a given parking lot).
- needs unit tests
- needs hooking up parkingInfo schema which can be utilized for analytics, e.g. for determing which user is using the service the most