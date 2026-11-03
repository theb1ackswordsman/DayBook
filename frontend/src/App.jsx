import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import AppToastContainer from "./components/ui/Toast";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Entries from "./pages/Entries";
import About from "./pages/About";
import ProfilePage from "./pages/ProfilePage";
import Guidelines from "./pages/Guidelines";
import PostDetail from "./pages/PostDetail";
import Notifications from "./pages/Notifications";
import Credits from "./pages/Credits";
import CheckInHub from "./pages/CheckInHub";
import Who5Flow from "./pages/Who5Flow";
import MiniIpipFlow from "./pages/MiniIpipFlow";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppToastContainer />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="entries" element={<Entries />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="guidelines" element={<Guidelines />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="check-in" element={<CheckInHub />} />
            <Route path="check-in/who5" element={<Who5Flow />} />
            <Route path="check-in/personality" element={<MiniIpipFlow />} />
            <Route path="insights" element={<Insights />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="about" element={<About />} />
            <Route path="credits" element={<Credits />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
