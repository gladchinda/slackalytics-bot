# slackalytics-bot
**Send Slack messaging metrics to Google Analytics.**

This project contains the sourcecode for a simple Slack bot that basically sends metrics for Slack messages to Google Analytics in realtime. It leverages on the realtime messaging client and the web client provided by the Slack API.

The inspiration for this project was gotten from previous work on a Slack integration named **Slackalytics** originally created by Nico Miceli and Joe Zeoli, and later extended by Fuzz Worley.

This implementation of the bot is only interested in messaging events triggered from public channels and private channels(groups) to ehich the bot has been added as a member. For your own bot requirements, you can customize the sourcecode to add new features and handling of other types of Slack events.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

1. **Install Node on your machine**: Ensure that you have **Node** and **npm** or **Yarn** installed on your machine. To install Node and npm on your machine, see the [Node download page](https://nodejs.org/en/download/). If you prefer using [Yarn](https://yarnpkg.com/) as your package manager to using npm, you can [get Yarn here](https://yarnpkg.com/en/docs/install).

2. **Setup a Slack application and bot user**: Create a new Slack application for your team at [https://api.slack.com/apps](https://api.slack.com/apps). Next, create a bot user with the desired permissions and install the bot to get the **bot access token** which will be used in the configuration file. You can follow this step-by-step guide for [building Slack apps](https://api.slack.com/slack-apps).

3. **Create a Google Analytics application**: Create a new app on the [Google Analytics console](https://analytics.google.com/analytics) and get the **Tracking ID**. Once the app is created you will need to setup some custom definitions for reporting. The following custom definitions need to be setup for this implementation of the bot as shown in the screenshots.

**Custom Dimensions**

![Custom Dimensions](https://i.imgur.com/akZSj2W.png)


**Custom Metrics**

![Custom Metrics](https://i.imgur.com/6wLyDE1.png)


### Setup Instructions

1. **Clone the repository** into a new directory on your machine.

2. **Install the dependencies** by running the following command from the new directory.

```sh
npm install
```

or using `yarn`

```sh
yarn install
```

3. **Create a `.env` file** in the root of the new directory with the following content.

```ini
###############################################################################
# SLACK APP CREDENTIALS
###############################################################################

TEST_SLACK_ACCESS_TOKEN=YOUR_SLACK_ACCESS_TOKEN
LIVE_SLACK_ACCESS_TOKEN=YOUR_SLACK_ACCESS_TOKEN

###############################################################################
# GOOGLE ANALYTICS APP CREDENTIALS
###############################################################################

TEST_GOOG_ANALYTICS_TRACKING_ID=YOUR_GOOG_ANALYTICS_TRACKING_ID
LIVE_GOOG_ANALYTICS_TRACKING_ID=YOUR_GOOG_ANALYTICS_TRACKING_ID
```

4. **Start the app** by running the following command. The app will run on port 3000 unless that port is already in use.

```sh
npm run dev
```

For `production`

```sh
npm start
```

## Acknowledgements

