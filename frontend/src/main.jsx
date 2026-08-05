import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import './styles/tokens.css';

import Login from './pages/Login.jsx';

import PassengerLayout from './pages/passenger/PassengerLayout.jsx';
import Profile from './pages/passenger/Profile.jsx';
import PassengerResources from './pages/passenger/Resources.jsx';
import History from './pages/passenger/History.jsx';

import CrewLeadLayout from './pages/crewlead/CrewLeadLayout.jsx';
import UsageReports from './pages/crewlead/UsageReports.jsx';
import Passengers from './pages/crewlead/Passengers.jsx';
import PassengerForm from './pages/crewlead/PassengerForm.jsx';
import CrewResources from './pages/crewlead/Resources.jsx';
import ResourceForm from './pages/crewlead/ResourceForm.jsx';
import ResourceDetail from './pages/crewlead/ResourceDetail.jsx';
import Tiers from './pages/crewlead/Tiers.jsx';
import TierForm from './pages/crewlead/TierForm.jsx';
import AuditLog from './pages/crewlead/AuditLog.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login/passenger" replace />} />
        <Route path="/login/passenger" element={<Login role="Passenger" />} />
        <Route path="/login/crewlead" element={<Login role="CrewLead" />} />

        <Route path="/passenger" element={<PassengerLayout />}>
          <Route path="profile" element={<Profile />} />
          <Route path="resources" element={<PassengerResources />} />
          <Route path="history" element={<History />} />
        </Route>

        <Route path="/crewlead" element={<CrewLeadLayout />}>
          <Route path="reports" element={<UsageReports />} />
          <Route path="passengers" element={<Passengers />} />
          <Route path="passengers/new" element={<PassengerForm />} />
          <Route path="passengers/:id/edit" element={<PassengerForm />} />
          <Route path="resources" element={<CrewResources />} />
          <Route path="resources/new" element={<ResourceForm />} />
          <Route path="resources/:id" element={<ResourceDetail />} />
          <Route path="resources/:id/edit" element={<ResourceForm />} />
          <Route path="tiers" element={<Tiers />} />
          <Route path="tiers/new" element={<TierForm />} />
          <Route path="tiers/:id/edit" element={<TierForm />} />
          <Route path="audits" element={<AuditLog />} />
        </Route>

        <Route path="*" element={<Navigate to="/login/passenger" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
