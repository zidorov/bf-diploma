import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import './../css/index.css'

class App extends React.Component {

    constructor(props){
      super(props)
      this.state = {
        NumberOfIssuers: 0,
      }

      if(typeof web3 != 'undefined'){
        console.log("Using web3 detected from external source like Metamask")
        this.web3 = new Web3(web3.currentProvider)
      }else{
        console.log("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
      }

      const MyContract = web3.eth.contract([ { "constant": true, "inputs": [], "name": "Owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "_issuer", "type": "address" }, { "name": "_issuerName", "type": "string" }, { "name": "_issuerWebDomain", "type": "string" } ], "name": "registerIssuer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_issuer", "type": "address" } ], "name": "getIssuerName", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_issuer", "type": "address" } ], "name": "getIssuerWebDomain", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getNumberOfIssuers", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_diplomaData", "type": "string" } ], "name": "registerDiploma", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_diplomaData", "type": "string" } ], "name": "checkDiploma", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ])
      this.state.ContractInstance = MyContract.at("0xe3da77c172fbf227a0492134d41c2e078b4a7d26")

    }

    componentDidMount(){
      this.updateState()
      setInterval(this.updateState.bind(this), 10e3)
    }

    updateState(){

        this.state.ContractInstance.getNumberOfIssuers((err, result) => {
         if(result != null){
            this.setState({
               NumberOfIssuers: parseFloat(result)
            })
         }
        })
    }

    addIssuer(cb) {
        let address = this.refs['issuer-address'].value
        if (!address) {
            alert('You must specify ethereum address of issuer')
            cb()
        }
/*        else if (!this.web3.utils.isAddress(address)) {
            alert('Incorrect ethereum address')
            cb()
            } */
        else {

        }
    }

    render(){
          return (
             <div className="main-container">

                <div className="block">
                   <b>Number of issuers:</b> &nbsp;
                   <span>{this.state.NumberOfIssuers}</span>
                </div>
                <hr />

                <label>
                   <b>Add issuer: <input className="bet-input" ref="issuer-address" placeholder="0x375F3957fbd1b616BECeE145B96F77f7Cb2563ec"/></b>
                   <br/>
                   <button onClick={() => {this.addIssuer()}}>add issuer</button>
                </label>

             </div>
          )
       }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)