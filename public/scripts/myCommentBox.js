var NewCommentBox = React.createClass({
  loadCommentsFromServer () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        //set new data received from server
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, error) {
        console.log(this.props.url, status, error.toString());
      }.bind(this)
    });
  },

  onCommentSubmit (comment) {
    var comments = this.state.data;
    //optimistic UI
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    //intermediately render new comment on UI
    //we can apply css to mark this is a temporary comment
    // and will be replace by the "real" comment latter
    this.setState({data: newComments});
    //
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function (data) {
        //render new data from server
        this.setState({data: data});
      }.bind(this),
      error: function () {
        console.log('Cannot get comment list from server');
      }
    });
  },
  getInitialState () {
    //data property will be pass to children component so we need an initial state
    return {data: []};
  },
  componentDidMount () {
    this.loadCommentsFromServer();
    //polling new data to update UI
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render() {
    return (
      <div>
        <h1>Comment Box</h1>
        <NewCommentList data={this.state.data}/>
        <NewCommentForm onCommentSubmit={this.onCommentSubmit}/>
      </div>
    );
  }
});

var NewCommentList = React.createClass({
  render () {
    var commentNodes = this.props.data.map(function (comment) {
      return (
        <NewComment author={comment.author} key={comment.id}>
          {comment.text}
        </NewComment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>

    );
  }
});


var NewComment = React.createClass({
  rawMarkup () {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return {__html: rawMarkup};
  },
  render () {
    return (
      <div className="comment">
        <h4 className="commentAuthor">
          Author: {this.props.author}
        </h4>
        <span dangerouslySetInnerHTML={this.rawMarkup()}/>
      </div>
    );
  }
});


var NewCommentForm = React.createClass({
  ///
  getInitialState () {
    return {author: '', text: ''};
  },
  ///
  handleSubmit(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!author && !text) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    //clear form
    this.setState({author: '', text: ''})
  },
  handleAuthorChange(e) {
    this.setState({author: e.target.value});
  },
  handleCommentChange(e) {
    this.setState({text: e.target.value});
  },
  render() {
    return (
      <div>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label className="col-sm-2 control-label"
                   htmlFor="author">Author</label>
            <div className="col-sm-10">
              <input id="author"
                     className="form-control"
                     type="text"
                     placeholder="Your Name"
                     value={this.state.author}
                     onChange={this.handleAuthorChange}
              />
            </div>

          </div>
          <div className="form-group">
            <label className="col-sm-2 control-label"
                   htmlFor="comment">Comment</label>
            <div className="col-sm-10">
              <input id="comment"
                     className="form-control"
                     type="text"
                     placeholder="Comment (Markdown supported)"
                     value={this.state.text}
                     onChange={this.handleCommentChange}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <input className="btn btn-primary"
                     type="submit"
                     value="Post"/>
            </div>
          </div>
        </form>
        <div>
          <h2>Preview</h2>
          <NewComment author={this.state.author}>
            {this.state.text}
          </NewComment>
        </div>
      </div>
    );
  }
});


ReactDOM.render(
  <NewCommentBox url="api/comments" pollInterval="2000"/>,
  document.getElementById('content')
);
