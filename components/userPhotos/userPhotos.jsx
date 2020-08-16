import React from 'react';
import {Link} from 'react-router-dom';
import {
  Typography,
  Divider
} from '@material-ui/core';
import './userPhotos.css';


import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import axios from 'axios';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
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
    //   photoModel: photoModel,
    //   onlyOnePhoto: (photoModel.length === 1)
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
      onlyOnePhoto: null
    }

    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
  }
  handleSuccess(value) {
    //recall, fetchModel returns modelInfo in object.data property.
    let isPhotos = value.data.length !== undefined;
    if (isPhotos) {
      this.setState( {
        photoIsLoaded: true,
        id: this.props.match.params.userId,
        photoModel: value.data,
        onlyOnePhoto: (value.data.length === 1),
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
  getUserPhotos() {
    const isLoaded = this.state.userIsLoaded;
    const error = this.state.error;
    if (error || !isLoaded) {
      return;
    }

    let imageElements = [];
    let keyId = 0;
    for (let image of this.state.userModel) {
      imageElements.push(<img src={"images/"+image.file_name} key={keyId} />)
      keyId += 1;
    }
    return imageElements;
  }
  getGridListTiles() {
    const isLoaded = this.state.photoIsLoaded;
    const error = this.state.error;
    if (error || !isLoaded) {
      return;
    }

    let gridTiles = []
    for (let image of this.state.photoModel) {
      let imageElem = <img src={"images/"+image.file_name} alt={image.file_name} />;
      let tileBarElem = <GridListTileBar title={`${image.file_name} (${image.date_time})`} />;
      let tileElem = <GridListTile key={image.file_name}>
        {imageElem}
        {tileBarElem}
      </GridListTile>;
      gridTiles.push(tileElem);
    }
    return gridTiles;
  }
  getOneComment(commentObject, insertDiv=true) {
    let linkPath = "/users/" + commentObject.user._id;
    return (
      <div key={commentObject._id}>
      <Typography color="textSecondary" component="p">
        <Link to={linkPath} className="userPhotos-link"><b>{commentObject.user.first_name + " " + commentObject.user.last_name}</b></Link> ({commentObject.date_time}) <br/>
        {commentObject.comment} <br/>
      </Typography>
      {(insertDiv) && (<Divider/>)}
      </div>
    );
  }
  getComments(commentObjects, commentTitle) {
    let comments = [
    <Typography gutterBottom variant="h5" component="h2" key="comments"> Comments for {commentTitle} </Typography>,
    <Divider key="divider"/>
    ];
    if (commentObjects === undefined) {
      return comments;
    }
    let n = commentObjects.length;
    for (let i = 0; i < n; i++) {
      let com = this.getOneComment(commentObjects[i], i < n-1);
      comments.push(com);
    }
    return comments;
  }
  getCommentCards() {
    const isLoaded = this.state.photoIsLoaded;
    const error = this.state.error;
    if (error || !isLoaded) {
      return;
    }
    let cards = []
    for (let image of this.state.photoModel) {
      let imageElem = <div className="userDetail-coverImageBox">
              <img className="userDetail-coverImage" src={"images/"+image.file_name}></img>
            </div>;

      let card = <Card key={image.file_name} style={{ left: 0 }}>
        <CardContent>
          {imageElem}
          {this.getComments(image.comments, image.file_name + " (" + image.date_time + ")")}
        </CardContent>
      </Card>
      cards.push(card)
    }
    return cards;
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
    const isLoaded = this.state.userIsLoaded;
    const error = this.state.error;

    let full_name = "";
    if (isLoaded && !error) {
      full_name = this.state.first_name+" "+this.state.last_name;
    }
    return (
      <div className="userPhotos-root">
        <h1 className="userPhotos-pageTitle">{full_name}&apos;s Photo Gallery</h1>
        {
        //aesthetic grid list w.o. comments.
        (!this.state.onlyOnePhoto) && (<GridList cellHeight={180} className="userPhotos-gridList">
          <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
            <ListSubheader component="div" style={{color: 'white'}}>
              A Quick Photo Overview
            </ListSubheader>
          </GridListTile>
          { this.getGridListTiles() }
        </GridList>)
        }
        <ul>
        {
          //cards with comments
          this.getCommentCards()
        }
        </ul>
      </div>
  );
  }
}

export default UserPhotos;
