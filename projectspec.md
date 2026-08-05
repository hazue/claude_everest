## Project Name
Passenger Resource Management


## Tech Stack
Frontend > React
Backend > Node.js / Express
Database > node:sqlite


## RDBMS Table Design
CrewLead
- CrewLeadID (primary key)
- CrewLeadAccessCode (comment: "complicated string readable from access card")
- CrewLeadEmployeeID
- CrewLeadName

PassengerTier
- PassengerTierID (primary key)
- PassengerTierName
- IsDeleted (boolean, default: false)

Passenger
- PassengerID (primary key)
- PassengerAccessCode (comment: "complicated string readable from access card")
- PassengerName
- PassengerTierID (foreign key)
- IsDeleted (boolean, default: false)

Resource
- ResourceID (primary key)
- ResourceName
- PassengerTierIDs (data type: JSON array)
- IsDeleted (boolean, default: false)

PassengerResourceUsage
- PassengerResourceUsageID (primary key)
- PassengerID (foreign key)
- ResourceID (foreign key)
- ResourceUsageStartDT (default value: current datetime)
- ResourceUsageEndDT (nullable)
- ResourceUsageTotalDuration (nullable. value=ResourceUsageEndDT-ResourceUsageStartDT)
- CreatedBy (format: "Passenger_<PassengerID>" or "CrewLead_<CrewLeadID>", identifying the actual acting user)
- UpdatedBy (nullable. format: "Passenger_<PassengerID>" or "CrewLead_<CrewLeadID>", identifying the actual acting user)

PassengerTierAudit
- PassengerTierAuditID (primary key)
- PassengerTierID (foreign key)
- Action (only allow string value "Create, Update, Delete")
- Old_PassengerTierName (nullable)
- New_PassengerTierName (nullable)
- CreatedOn (default value: current datetime)
- CreatedBy (values should be CrewLead_001 only)

PassengerAudit
- PassengerAuditID (primary key)
- PassengerID (foreign key)
- Action (only allow string value "Create, Update, Delete")
- Old_PassengerName (nullable)
- New_PassengerName (nullable)
- Old_PassengerTierID (nullable)
- New_PassengerTierID (nullable)
- CreatedOn (default value: current datetime)
- CreatedBy (values should be CrewLead_001 only)

ResourceAudit
- ResourceAuditID (primary key)
- ResourceID (foreign key)
- Action (only allow string value "Create, Update, Delete")
- Old_ResourceName (nullable)
- New_ResourceName (nullable)
- Old_PassengerTierIDs (nullable, data type: JSON array)
- New_PassengerTierIDs (nullable, data type: JSON array)
- CreatedOn (default value: current datetime)
- CreatedBy (values should be CrewLead_001 only)


## User Interface
Passenger
- Login Page
- Profile Page (Read-only. Data load from RBMS table "Passenger", filtered by "Passenger.PassengerID")
- Resource Page (Read-only. Data load from RBMS table "Resource", filtered by Passenger's current tiers only)
- History Page (Read-only. Data load from RBMS table "PassengerResourceUsage", filtered by "PassengerResourceUsage.PassengerID". Exclude Resource currently in-use.)

Crew Lead (Admin)
- Login Page
- Usage Reports
    - View by Passenger (Data load from RBMS table "PassengerResourceUsage". Aggregated by PassengerID and sum of ResourceUsageTotalDuration. Filteretable by ResourceUsageStartDT in date range. Include Resource currently in-use, shown in a distinct status label "In-Use")
    - View by Resource (Data load from RBMS table "PassengerResourceUsage". Aggregated by ResourceID and sum of ResourceUsageTotalDuration. Filteretable by ResourceUsageStartDT in date range. Include Resource currently in-use, shown in a distinct status label "In-Use")
- Passenger List (Data load from RBMS table "Passenger")
    - View/Edit/Delete A Passenger
- Create New Passenger
- Resource List (Data load from RBMS table "Resource")
    - View/Edit/Delete A Resource
        - While Viewing Resource, there should be a button to lock/unlock resource hardware.
            - After Passenger has finished using the resource, either Passenger or Crew Lead may lock the resource, thus updating ResourceUsageEndDT
- Create New Resource
- Passenger Tier List (Data load from RBMS table "PassengerTier")
    - View/Edit/Delete A Passenger Tier
- Create New Passenger Tier
- Passenger Audit (Data load from RBMS table "PassengerAudit")
- Resource Audit (Data load from RBMS table "ResourceAudit")
- Passenger Tier Audit (Data load from RBMS table "PassengerTierAudit")


## Security
Login Page for both Passenger and Crew Lead are done via scanning an access card. There will be an external hardware that read the access card and auto-input code into the login page. Access code shown in the page should be only for UX purpose and be masked at all time.

Login session expired after user (Passenger & Crew Lead) log out, or after inactivity of 60 seconds.
The login page is accessed from a shared device so user is strongly adviced to log out immediately after accessing the page. Similar to online banking platform, there should be a visible countdown timer in the last 10 seconds.
Users should not leave the device alone without logging out, if they do, any misuse will be their responsibility.
Session expiration should result in both server & client side. For the client side, it should auto-redirect to login.
For inactivity of 60 seconds, do not show anything until the last 10 seconds. At the last 10 seconds, show a simple prompt with "countdown timer", a button to resume session, and a button to log out.

Access Code stored in DB are encrypted string, there is no way to know the actualy access code unless the physical Access Card is stolen.

There are 3 API endpoint used only by hardware.
- To validate Passenger Tier
- To insert PassengerResourceUsage, returning newly created PassengerResourceUsageID.
- To update PassengerResourceUsage, which requires PassengerResourceUsageID.

Only hardware authorised by Mac Address may call this API endpoint. Mac Address is whitelisted by router.
Router & network are assumed to be highly secured.
Assume One Resource has only One hardware, thus there is no need to authenticate hardware MAC address with resource ID.

Each Passenger can only have one access card, and it is their responsibility to keep it safe. There will be no mechanism to rotate or invalidate access code.

Everything happen within an intranet, so external cyber attack should not be possible.
All critical devices & computer hardware are monitored by CCTV, so internal cyber attack should be difficult.

All Crew Leads have access to all Passenger Tiers, Passengers, and Resources. There will be no ownership.


## Audit Log
All Create, Update & Delete MUST BE recorded.
A Delete action will be soft delete.

"PassengerTierAudit" Audit into "PassengerTierAudit"
"Passenger" Audit into "PassengerAudit"
"Resource" Audit into "ResourceAudit"


## Additional Rules
Crew Lead and Passenger should be separate login page, but the UI can look identifical.

Crew Lead may delete to a record, but it should be soft delete.
All soft deleted records SHOULD NOT BE visible in UI except in Usage & Audit Reports.

If a Crew Lead soft-deletes a PassengerTier that is still referenced in Passenger.PassengerTierID or Resource.PassengerTierIDs, the system SHOULD BLOCK the deletion.
If a Crew Lead soft-deletes a Passenger that is still using a resource, the system SHOULD BLOCK the deletion.
If a Crew Lead soft-deletes a Resource that is still being used by passenger, the system SHOULD BLOCK the deletion.

For PassengerResourceUsage.CreatedBy & PassengerResourceUsage.UpdatedBy 
- If a Passenger wants to use a Resource, passenger will have to unlock the resource by scanning their access card via a hardware reader. The hardware will then call an API endpoint to validate Passenger's Tier. If Passenger Tier matches, then the hardware will be unlocked, and call another API to write into PassengerResourceUsage, with ResourceUsageStartDT=now, ResourceUsageEndDT=NULL, CreatedBy should be Passenger_001
- Once Passenger has finished using a resource, passenger will lock the resource. Which then the hardware will automatically call the API end-point to update PassengerResourceUsage.ResourceUsageEndDT=now and PassengerResourceUsage.UpdatedBy=Passenger_001
- A Crew Lead may lock/unlock a resource for a passenger to use.
    - When unlocking a resource, Crew Lead will have to enter the PassengerID (searchable via Passenger Name). PassengerResourceUsage.CreatedBy will be `CrewLead_<CrewLeadID>` (the actual acting Crew Lead's ID).
    - When locing a resource, PassengerResourceUsage.UpdatedBy will be `CrewLead_<CrewLeadID>` (the actual acting Crew Lead's ID).
- It is possible for a Passenger to unlock a device, but locked by Crew Lead, and vice versa.

Passenger has no direct way to do any UPDATE to any RDBMS tables.

PassengerResourceUsage itself acts as audit trail, so additional audit table is not required.

Assume each Resource will always be used by only One Passenger. So the system doesn't have to validate if same resouce is used by multiple passenger at the same time.
