import React from 'react';
import {Link} from 'react-router-dom';

import {
  Typography
} from '@material-ui/core';
import './userDetail.css';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import axios from 'axios';



/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    // Problem #1: use window.cs142models hack for server.
    // let userModel = window.cs142models.userModel(this.props.match.params.userId);
    // let photoModel = window.cs142models.photoOfUserModel(this.props.match.params.userId);
    // this.state = {
    //   id: this.props.match.params.userId,
    //   userModel: userModel,
    //   first_name: userModel.first_name,
    //   last_name: userModel.last_name,
    //   description: userModel.description,
    //   location: userModel.location,
    //   occupation: userModel.occupation,
    //   photoModel: photoModel
    // }

    // Project 5, Problem #2: use lib/fetchModel to interface XMLHttpResponse
    // Project 6, Problem #2: use axios ... 
    this.state = {
      userIsLoaded: false,
      photoIsLoaded: false,
      error: null,

      id: this.props.match.params.userId,
      userModel: null,
      first_name: null,
      last_name: null,
      description: null,
      location: null,
      occupation: null,
      photoModel: null,
    }

    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
  }
  getPhotoPath(idx) {
    const error = this.state.error;
    const isLoaded = this.state.photoIsLoaded;

    if (error || !isLoaded) {
      return;
    }

    let imagePaths = [];
    for (let image of this.state.photoModel) {
      imagePaths.push("images/"+image.file_name);
    }
    return (idx < imagePaths.length) ? imagePaths[idx] : imagePaths[0];
  }
  handleSuccess(value) {
    //recall, fetchModel/axios.get() returns modelInfo in object.data property.
    let isPhotos = value.data.length !== undefined;
    if (isPhotos) {
      this.setState( {
        photoIsLoaded: true,
        id: this.props.match.params.userId,
        photoModel: value.data 
      } );
    } else {
      this.setState( {
        userIsLoaded: true,
        id: this.props.match.params.userId,
        userModel: value.data,
        first_name: value.data.first_name,
        last_name: value.data.last_name,
        description: value.data.description,
        location: value.data.location,
        occupation: value.data.occupation,
      } );
    }
  }
  handleError(error) {
    this.setState( {
      error: error
    } );
  }
  componentDidMount() {
    let currId = this.props.match.params.userId;

    // use axios. faster wrapper around XMLHttpRequest
    axios.get("/user/" + currId).then(this.handleSuccess).catch(this.handleError);
    axios.get("/photosOfUser/" + currId).then(this.handleSuccess).catch(this.handleError);
  }
  componentDidUpdate(prevProps) {
    let prevId = prevProps.match.params.userId;
    let currId = this.props.match.params.userId;
    if (prevId !== currId) {
      // use axios. faster wrapper around XMLHttpRequest
      axios.get("/user/" + currId).then(this.handleSuccess).catch(this.handleError);
      axios.get("/photosOfUser/" + currId).then(this.handleSuccess).catch(this.handleError);
    }
  }
  render() {
    const error = this.state.error;
    const isLoaded = this.state.userIsLoaded;

    let full_name = "";
    let location = "";
    let occupation = "";
    let description = "";
    let id = "";
    if (isLoaded && !error) {
      full_name = this.state.first_name + " " + this.state.last_name;
      location = this.state.location;
      occupation = this.state.occupation;
      description = this.state.description;
      id = this.state.id;
    }
    return (
      <div>
      {
        <Card className="userDetail-cardRoot">
            <div className="userDetail-coverImageBox">
              <img className="userDetail-coverImage" src={this.getPhotoPath()}></img>
            </div>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {full_name}
              </Typography>
              <Typography color="textSecondary" component="p">
                <b>Location:</b> {location} <br/>
                <b>Occupation:</b> {occupation} <br/>
                <b>Description:</b> {description} <br/>
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                <Link to={"/photos/" + id}> View Photos </Link>
              </Button>
            </CardActions>
        </Card>
      }
      </div>
    );
  }
}

export default UserDetail;
