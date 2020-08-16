import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@material-ui/core';
import './TopBar.css';

import axios from 'axios';


/**
 * Define TopBar, a React component of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    // Project 5, Problem #2: use lib/fetchModel to interface XMLHttpResponse
    // Project 6, Problem #2: use axios ... 
    this.state = {
      currUrl: this.props.match.url,

      versionIsLoaded: false,
      userIsLoaded: false,

      error: null,

      version: null,
      userModel: null
    }

    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
  }
  handleSuccess(value) {
    //calls to setState will invoke render() again.
    const isTestSchema = Object.keys(value.data).includes("__v");
    if (isTestSchema) {
      this.setState( {
        versionIsLoaded: true,
        version: value.data.__v
      } );
    } else {
      this.setState( {
        userIsLoaded: true,
        userModel: value.data
      } );
    }
  }
  handleError(error) {
    this.setState( {
      error: error
    } );
  }
  componentDidMount() {
    // called after initial mount to DOM. Thus, only called once.
    // see React Component Lifecyle.
    axios.get("/test/info/").then(this.handleSuccess).catch(this.handleError);

    // fetch userModel.
    let url = this.props.match.url;
    let uIndex = url.search(/\/photos\//i);
    let pIndex = url.search(/\/users\//i);
    const atHomePage = (uIndex === -1 && pIndex === -1);

    if (!atHomePage) {
      const currId = url.substring(url.lastIndexOf("/")+1);
      axios.get("/user/" + currId).then(this.handleSuccess).catch(this.handleError);
    }
  }
  componentDidUpdate(prevProps) {
    const prevUrl = prevProps.match.url;
    const currUrl = this.props.match.url;

    if (prevUrl !== currUrl) {
      let uIndex = currUrl.search(/\/photos\//i);
      let pIndex = currUrl.search(/\/users\//i);
      const atHomePage = (uIndex === -1 && pIndex === -1);

      if (!atHomePage) {
        const currId = currUrl.substring(currUrl.lastIndexOf("/")+1);
        axios.get("/user/" + currId).then(this.handleSuccess).catch(this.handleError);
      } else {
        //only userModel will change since testSchema.__v is hardcoded.
        //single fetch from DidMount is enough. so no need to re-FETCH version number.
      }
    }
  }
  render() {
    // get location info from url.
    let url = this.props.match.url;
    let uIndex = url.search(/\/photos\//i);
    let pIndex = url.search(/\/users\//i);
    const atHomePage = (uIndex === -1 && pIndex === -1);

    let context = "";
    if (atHomePage) {
      const isLoaded = this.state.versionIsLoaded;
      const error = this.state.error;
      if (error || !isLoaded) {
        context = "Home Page";
      } else {
        context = "Home Page " + this.state.version;
      }
    } else {
      const isLoaded = this.state.userIsLoaded;
      const error = this.state.error;
      if (error || !isLoaded) {
        //don't display anything for context.
      } else {
        let userModel = this.state.userModel;
        let name = userModel.first_name + " " + userModel.last_name;
        context = (uIndex === -1) ? name : name + "'s Photos";
      }
    }
    
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar className="cs142-topbar-flexbox">
          <Typography variant="h5" color="inherit" className="cs142-topbar-flexitem name">
            Reagan Kan&apos;s FB
          </Typography>

          <Typography variant="h5" color="inherit" className="cs142-topbar-flexitem context">
            {
              context
            }
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
