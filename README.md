Parking Lot API version 1.0
 
- allows for CRUD operations on cars, users, parking lots and spots.
- provides APIs for computing cost on exit, identifying parked cars in a parking lot, car in a parking spot, available parking spots (in a parking lot, city B, or near postal code)
- needs better validation, e.g. checking if required fields exist    
- needs proper error handling, returning granular error message, e.g. on validation 
- needs refactoring to have a proper middleware (for doing validation) and endpoints which act on Object Oriented classes (prototype) for models, controllers
- needs API for determining available parking spots for a given size (and a given parking lot).
- needs API for creating default parking lot layout based on car distribution
- needs unit tests
- needs hooking up parkingInfo schema which can be utilized for analytics, e.g. for determing which user is using the service the most