const User = require('../models/User');
const Route = require('../models/Route');
const Bus = require('../models/Bus');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@mycampusride.local' 
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@mycampusride.local',
      password: process.env.ADMIN_PASSWORD || 'AdminPass123!',
      role: 'admin',
      phone: '+1234567890',
      status: 'active'
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'AdminPass123!'}`);
    console.log(`   Role: ${admin.role}`);
    console.log('   Status: Active');

    // Create sample routes
    await seedSampleRoutes();
    
    // Create sample buses
    await seedSampleBuses();
    
    // Assign routes to students and buses to drivers
    await assignRoutesAndBuses();

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};

const seedSampleRoutes = async () => {
  try {
    // Check if routes already exist
    const existingRoutes = await Route.countDocuments();
    if (existingRoutes > 0) {
      console.log('✅ Sample routes already exist');
      return;
    }

    const sampleRoutes = [
      {
        routeName: 'Route A - North Campus',
        description: 'Main route covering North Campus area',
        stops: [
          {
            name: 'Main Gate',
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 University Ave, Main Gate',
            sequence: 1,
            estimatedArrival: '08:00'
          },
          {
            name: 'Library',
            latitude: 40.7138,
            longitude: -74.0070,
            address: '456 Library St, Library Building',
            sequence: 2,
            estimatedArrival: '08:15'
          },
          {
            name: 'Science Building',
            latitude: 40.7148,
            longitude: -74.0080,
            address: '789 Science Ave, Science Building',
            sequence: 3,
            estimatedArrival: '08:30'
          },
          {
            name: 'Dormitory Complex',
            latitude: 40.7158,
            longitude: -74.0090,
            address: '321 Dorm St, Student Housing',
            sequence: 4,
            estimatedArrival: '08:45'
          }
        ],
        timings: {
          startTime: '08:00',
          endTime: '18:00',
          frequency: 15
        },
        distance: 5.2,
        estimatedDuration: 45,
        color: '#3B82F6'
      },
      {
        routeName: 'Route B - South Campus',
        description: 'Route covering South Campus and residential areas',
        stops: [
          {
            name: 'Student Center',
            latitude: 40.7168,
            longitude: -74.0100,
            address: '654 Student Blvd, Student Center',
            sequence: 1,
            estimatedArrival: '08:00'
          },
          {
            name: 'Gymnasium',
            latitude: 40.7178,
            longitude: -74.0110,
            address: '987 Fitness St, Sports Complex',
            sequence: 2,
            estimatedArrival: '08:20'
          },
          {
            name: 'Cafeteria',
            latitude: 40.7188,
            longitude: -74.0120,
            address: '147 Food Ave, Dining Hall',
            sequence: 3,
            estimatedArrival: '08:40'
          },
          {
            name: 'Parking Lot',
            latitude: 40.7198,
            longitude: -74.0130,
            address: '258 Parking Dr, Main Parking',
            sequence: 4,
            estimatedArrival: '09:00'
          }
        ],
        timings: {
          startTime: '08:00',
          endTime: '17:30',
          frequency: 20
        },
        distance: 4.8,
        estimatedDuration: 40,
        color: '#10B981'
      },
      {
        routeName: 'Route C - East Campus',
        description: 'Express route for East Campus facilities',
        stops: [
          {
            name: 'Administration Building',
            latitude: 40.7208,
            longitude: -74.0140,
            address: '369 Admin St, Admin Building',
            sequence: 1,
            estimatedArrival: '08:00'
          },
          {
            name: 'Computer Lab',
            latitude: 40.7218,
            longitude: -74.0150,
            address: '741 Tech Ave, Computer Center',
            sequence: 2,
            estimatedArrival: '08:25'
          },
          {
            name: 'Art Gallery',
            latitude: 40.7228,
            longitude: -74.0160,
            address: '852 Art St, Cultural Center',
            sequence: 3,
            estimatedArrival: '08:50'
          }
        ],
        timings: {
          startTime: '08:00',
          endTime: '16:00',
          frequency: 30
        },
        distance: 3.5,
        estimatedDuration: 30,
        color: '#F59E0B'
      }
    ];

    const createdRoutes = await Route.insertMany(sampleRoutes);
    console.log(`✅ Created ${createdRoutes.length} sample routes`);
  } catch (error) {
    console.error('❌ Error seeding sample routes:', error.message);
  }
};

const seedSampleBuses = async () => {
  try {
    // Check if buses already exist
    const existingBuses = await Bus.countDocuments();
    if (existingBuses > 0) {
      console.log('✅ Sample buses already exist');
      return;
    }

    // Get routes for bus assignment
    const routes = await Route.find();
    if (routes.length === 0) {
      console.log('⚠️  No routes found. Skipping bus creation.');
      return;
    }

    const sampleBuses = [
      {
        busNumber: 'BUS-001',
        capacity: 50,
        model: 'Mercedes-Benz Citaro',
        year: 2022,
        status: 'available',
        routeId: routes[0]._id
      },
      {
        busNumber: 'BUS-002',
        capacity: 45,
        model: 'Volvo 7900',
        year: 2021,
        status: 'available',
        routeId: routes[1] ? routes[1]._id : routes[0]._id
      },
      {
        busNumber: 'BUS-003',
        capacity: 40,
        model: 'Scania Citywide',
        year: 2023,
        status: 'maintenance',
        routeId: routes[2] ? routes[2]._id : routes[0]._id
      }
    ];

    const createdBuses = await Bus.insertMany(sampleBuses);
    console.log(`✅ Created ${createdBuses.length} sample buses`);
  } catch (error) {
    console.error('❌ Error seeding sample buses:', error.message);
  }
};

const assignRoutesAndBuses = async () => {
  try {
    // Get all routes and buses
    const routes = await Route.find();
    const buses = await Bus.find();
    
    if (routes.length === 0 || buses.length === 0) {
      console.log('⚠️  No routes or buses found for assignment');
      return;
    }

    // Assign routes to students (if any exist)
    const students = await User.find({ role: 'student' });
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const routeIndex = i % routes.length;
      student.assignedRoute = routes[routeIndex]._id;
      await student.save();
    }

    // Assign buses to drivers (if any exist)
    const drivers = await User.find({ role: 'driver', status: 'active' });
    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      const busIndex = i % buses.length;
      driver.assignedBus = buses[busIndex]._id;
      await driver.save();
      
      // Also update the bus to assign the driver
      buses[busIndex].driverId = driver._id;
      await buses[busIndex].save();
    }

    console.log(`✅ Assigned routes to ${students.length} students and buses to ${drivers.length} drivers`);
  } catch (error) {
    console.error('❌ Error assigning routes and buses:', error.message);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;


