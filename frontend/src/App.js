import React from "react";
import OrgTable from "./OrgTable";
import BubbleGraph from "./BubbleGraph";

export default function App() {
  const amount = 1000;
  return (
    <div className="App">
      <h1>BuzzWords(isch)</h1>
      <p>Här är dom vanligast förekommande orden, i beskrivningen, bland de {amount} bolag som har fått mest pengar</p>
      <p>Hovra över cirklarna för att se orden. Det går också att dra runt cirklarna för skojs skull</p> 
      <p>Jag hoppas att det inte är helt kaos att läsa koden och att det inte buggar för mycket</p> 
      <BubbleGraph amount={amount}/>
    </div>
  );
}
