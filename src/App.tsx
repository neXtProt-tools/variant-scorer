import React from "react";
import FeatureViewerComponent from "./components/FeatureViewer";
import "./App.css";
import Instructions from "./components/Instructions";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScorerViewer from "./components/ScorerViewer";

const App = () => {
  return (
    <div className="App">
      <Header />
      <ScorerViewer />
    </div>
  );
};

export default App;
