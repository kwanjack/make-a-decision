import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import ReactDOM from 'react-dom';

import Vote from './Vote.js';
 import { Votes } from '../api/votes.js';

const END_TIME = (new Date()).setHours(19,0,0);
const END_TIME_LOCALE_STRING = (new Date(END_TIME)).toLocaleString();

class App extends Component {
  constructor() {
    super();
    this.renderTimeLeft = this.renderTimeLeft.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.state = { currentTime: new Date(), lastSubmitted: 0 };
  }
  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ currentTime: new Date() });
  }

  handleSubmit(event) {
    event.preventDefault();
 
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    if (text === '') { return; }

    Votes.insert({
      text,
      createdAt: new Date(), // current time
    });
 
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }


  renderTimeLeft() {
    let { currentTime } = this.state;
    let nowTime = currentTime.getTime();

    if ( nowTime > END_TIME) { return; }
    let diff = END_TIME - nowTime;
    const ONE_MINUTE = 1000 * 60;

    let minutesLeft = diff / ONE_MINUTE;
    let secondsLeft = (diff % ONE_MINUTE) % 60;

    return `${Math.floor(minutesLeft)} MINUTES ${Math.floor(secondsLeft)} SECONDS LEFT UNTIL ${END_TIME_LOCALE_STRING}`;
  }
 
  renderVotes() {
    let votes = this.props.votes;
    let mostRecent= votes.slice(0,7);

    return <div>
      <div> MOST RECENT: </div>
      <div> { mostRecent.map((vote) => (
        <Vote key={vote._id} vote={vote} />
      )) }
      </div>
    </div>
  }

  renderMainMessage() {
    let { votes } = this.props;
    let mostRecent = votes.length > 0 ? votes[0] : { text: ''};

    let destination = mostRecent.text;

    return `WE ARE GOING TO ${destination}`
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleSubmit(e);
    }
  }

  renderInputBox() {
    let votes = this.props.votes;
    let latestVote = votes.length > 0 ? votes[0] : { createdAt: 0 };

    let { currentTime } = this.state;
    let nowTime = currentTime.getTime();

    const threshold = 1000 * 20;//20 seconds

    let lastPostIsOldEnough = latestVote.createdAt < (nowTime - threshold);

    let disable = !lastPostIsOldEnough;
    let placeholder = 'PLACE';

    if (!lastPostIsOldEnough) {

      let timeWhenUnlocked = latestVote.createdAt.getTime() + threshold;
      let timeElapsed = nowTime - latestVote.createdAt;
      let timeLeft = timeWhenUnlocked - nowTime;

      let timeLeftInSeconds = Math.ceil(timeLeft / 1000);
      placeholder = `wait ${timeLeftInSeconds} seconds`;
    }

    return <input onKeyPress={this._handleKeyPress}
      type="text"
      ref="textInput"
      placeholder={placeholder}
      disabled={disable}
    />

  }

  renderObjectionInput() {
    let { currentTime } = this.state;
    let nowTime = currentTime.getTime();

    if (nowTime > END_TIME) { return; }

    return <div>            
       <span> { 'OBJECTION LET US GO TO ' }</span>

       { this.renderInputBox() }

       <span> { ' INSTEAD' }</span>
    </div>

  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>{this.renderMainMessage()}</h1>
        </header>

        { this.renderObjectionInput() }

        <ul>
          {this.renderVotes()}
        </ul>
        <div>
          { this.renderTimeLeft() }
        </div>
      </div>
    );
  }

}

export default withTracker(props => {
  return {
    votes: Votes.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
})(App);