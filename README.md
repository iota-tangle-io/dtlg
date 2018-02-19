# DTLG [![Build Status](https://travis-ci.org/iota-tangle-io/dtlg.svg?branch=master)](https://travis-ci.org/iota-tangle-io/dtlg)

The Distributed Tangle Load Generator is an application for "spamming" the Tangle with healthy transactions
in order to increase overall transaction throughput.

**features:**
* modern web interface written in React
* websocket communication for real time updates from the spammer
* chart which shows transactions per seconds
* metrics about used trunk, branch and milestone transactions
* on-the-fly node and PoW method changing
* transaction log with confirmation rate

# usage

**note on the downloads**: you can check the md5 checksums of the binaries on the [Travis build log](https://travis-ci.org/iota-tangle-io/dtlg).

## desktop
1. download the zip file for your operating system from the [release page](https://github.com/iota-tangle-io/dtlg/releases). (darwin is for mac os)
2. unzip the zip file and execute the binary
3. your browser opens automatically
4. enter a node url (choose one from [http://iota.dance/](http://iota.dance/) or other node sites)
5. press the start button on the web interface to start generating transactions

## headless server
1. download the zip file for your operating system from the [release page](https://github.com/iota-tangle-io/dtlg/releases).
2. unzip the zip file and execute the binary
3. Access http://your-ip:9090 to open DTLG
4. enter a node url (choose one from [http://iota.dance/](http://iota.dance/) or other node sites)
5. press the start button on the web interface to start generating transactions

the port and interface on which DTLGs listens for requests can be modified in `configs/network.json`.

# proof of work
DTLG automatically uses the best available PoW method when starting. 
This is the preferred order of PoW methods: `SSE`, `C`, `Go`. In our tests however, PoW C was fastest on Mac, thereby
DTLG automatically defaults to it when it detects Mac systems. Our test system with Win10 and an i7 4770k@4,1Ghz reaches about ~1 TPS with `SSE`. The PoW method can be modified on the fly on the web interface.

![Imgur](https://i.imgur.com/56aNYH5.png)


