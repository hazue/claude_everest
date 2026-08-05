INSERT INTO CrewLead (CrewLeadAccessCode, CrewLeadEmployeeID, CrewLeadName) VALUES ('$2b$10$goAcQrFfWXcOvtd1ameyfeNZl6wLDBq5pkJ1/p1Vsjwzbp0lgdXPW', 'EMP001', 'Alice Smith');
INSERT INTO CrewLead (CrewLeadAccessCode, CrewLeadEmployeeID, CrewLeadName) VALUES ('$2b$10$kuW/LfM528U5aob/LyIzAuMdheTYpSSvC5rY79iUzuWMqJDEtkbIm', 'EMP002', 'Ben Reyes');
INSERT INTO CrewLead (CrewLeadAccessCode, CrewLeadEmployeeID, CrewLeadName) VALUES ('$2b$10$unB2QUZeRbUOAF.C3pJyquD09iWDbyfmI64L1HHZpDUV7QrCOanIC', 'EMP003', 'Chloe Patel');

INSERT INTO PassengerTier (passengertiername) VALUES ('Silver');
INSERT INTO PassengerTier (passengertiername) VALUES ('Gold');
INSERT INTO PassengerTier (passengertiername) VALUES ('Platinum');

INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$Y3E/CpJVjzz8DBaHVCMFk.ugll1HQuinCklzgmif9L7bcz3HN1rIm', 'Albert Jones', 1);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$eoJAjGYk6g.2f02avyTpCe.NWzYdSDuTOaNegixoUV3UMtS6BUE7S', 'Bernard Okafor', 1);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$UTqAEa1p4NSqeLGLVrRyKusWg0Z1Ss4jsodWcCt8Rz3jmuhPD4zdi', 'Clark Thornton', 1);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$M1Qny.yXVafHBlzyQbYQCucJjZcYbWguwVb4fCF1D0ZAFdcq3rmHa', 'Daniel Welsh', 1);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$lUTSKXmUu11jJL1sCLKiVuizqluVDx8gpaOHAKH4vUWgOBAypI.cC', 'Elly Nguyen', 2);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$Frw4cbkqD0yJjxzYTAN.DepJWt95JhfdjU4xNSLZYseDWtRID9pMe', 'Frank Yamada', 2);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$DSvqeojYz9ufnmhyeIiFdO2btisHzQPxejBoXdjLCYT8L2Wj3CRVm', 'Gilbert Fernandez', 2);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$3jNNewi0UH9DiXP6AjttBOwzo.Gtvrg4DAc/LgdQxW7cqGiDUfRA.', 'Helena Kim', 3);
INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES ('$2b$10$mh.fe.uXA5J4ESDuBTwwpO7McGRvqEa3BHZKIZ/rmXa7BJWS5o/VC', 'Iona Osei', 3);

INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES ('Food Stations', '[1,2,3]');
INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES ('Sleeping Pods', '[1,2,3]');
INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES ('Basic Hygiene', '[1,2,3]');
INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES ('Private Cabins', '[2,3]');
INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES ('Adv. Medical Bay', '[2,3]');
INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES ('Luxury O2 Pods', '[3]');
INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES ('VIP Rec Deck', '[3]');