"use strict";

// Libraries
var React = require("react"),
    Router = require("react-router"),
    Route = Router.Route,
    Routes = Router.Routes,
    Redirect = Router.Redirect,
    DefaultRoute = Router.DefaultRoute,

    //SailsWebApi = require("./utils/api/SailsWebApi.react"),
    // Layout
	App = require("./pages/layout.react"),
    // Components
    //DemoOne =   require("./pages/DemoOne.react"),
    DemoPage =  require("./pages/Demo.react");

       
    var routes = (
    	<Route name="app" path="/" handler={App}>
            <Route name="metrozbp" path="/metrozbp" handler={DemoPage} />
    		<DefaultRoute handler={DemoPage} />
    	</Route>
    );

Router.run(routes, (Handler) => {
	React.render(<Handler/>, document.getElementById("route-wrapper"));
});
