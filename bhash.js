// Example seed: node src/db/seed.js
// Creates sample data for development/testing.
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // Crew Lead (access code: "crewlead_a")
    let clHash = await bcrypt.hash('crewlead_a', 10);
    console.log("INSERT INTO CrewLead (CrewLeadAccessCode, CrewLeadEmployeeID, CrewLeadName) VALUES ('"+ clHash +"', 'EMP001', 'Alice Smith');");

    clHash = await bcrypt.hash('crewlead_b', 10);
    console.log("INSERT INTO CrewLead (CrewLeadAccessCode, CrewLeadEmployeeID, CrewLeadName) VALUES ('"+ clHash +"', 'EMP002', 'David Reyes');");

    clHash = await bcrypt.hash('crewlead_c', 10);
    console.log("INSERT INTO CrewLead (CrewLeadAccessCode, CrewLeadEmployeeID, CrewLeadName) VALUES ('"+ clHash +"', 'EMP003', 'Emma Patel');");

    // Passenger (access code: "passenger_a")
    let pHash = await bcrypt.hash('passenger_a', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Bob Jones', 1);");
    
    pHash = await bcrypt.hash('passenger_b', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Frank Okafor', 1);");
    
    pHash = await bcrypt.hash('passenger_c', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'James Thornton', 1);");
    
    pHash = await bcrypt.hash('passenger_d', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Henry Welsh', 1);");
    
    pHash = await bcrypt.hash('passenger_e', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Clara Nguyen', 2);");
    
    pHash = await bcrypt.hash('passenger_f', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Yamada Hanako', 2);");

    pHash = await bcrypt.hash('passenger_g', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Isla Fernandez', 2);");
    
    pHash = await bcrypt.hash('passenger_h', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Grace Kim', 3);");

    pHash = await bcrypt.hash('passenger_i', 10);
    console.log("INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('"+ pHash +"', 'Karen Osei', 3);");


  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
  }
}

seed();
