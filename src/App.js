import React from "react";
import { Provider } from "mobx-react";

import Pages from "./routes/pages";

class App extends React.Component {
  render() {
    return (
      <Provider>
        <Pages />
      </Provider>
    );
  }
}

export default App;
