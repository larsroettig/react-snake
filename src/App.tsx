import * as React from "react";
import "./App.css";
import { Grid } from "./Grid";

import { gameMachine } from "./game";

export interface IAppProps {}

const App = (props: IAppProps) => {
  return (
    <div className="Grid">
      <Grid rowCount={10} cellCount={10} gameMachine={gameMachine} />
    </div>
  );
};
export default App;
