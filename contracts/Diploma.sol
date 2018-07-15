pragma solidity ^0.4.23;

contract Diploma {

    address public Owner;

    struct Issuer {
        address issuer;
        string  issuerName;
        string  issuerWebDomain;
    }

    mapping(bytes32 => address) internal Diplomas;
    mapping(address => bool) internal Admins; // Who can add and remove issuers
    uint public numberOfDiplomas;
    mapping(address => Issuer) internal Issuers;
    address[] public issuersList;
    uint public numberOfAdmins;

    // https://ethereum.stackexchange.com/questions/6840/indexed-event-with-string-not-getting-logged/7170#7170
    // only fixed-size types can be indexed.
    event eNewAdminAdded(address _admin);
    event eAdminRemoved(address _admin);
    event eNewIssuerRegistered(address _issuer,string _issuerName, string _issuerWebDomain);
    event eIssuerRemoved(address _issuer);
    event eNewDiplomaRegistered(address _issuer, bytes32 _diplomaHash);

    constructor () public {
        Owner = msg.sender;
        addAdmin(msg.sender); //contract creator becomes the first admin and this admin is not removable
    }

    modifier onlyOwner() {
        require(msg.sender == Owner);
        _;
    }

    modifier onlyAdmin() {
        require(Admins[msg.sender] == true);
        _;
    }

    modifier onlyIssuer() {
        require(msg.sender != address(0));
        require(Issuers[msg.sender].issuer != address(0));
        _;
    }

    function addAdmin(address _admin)
        public onlyOwner {
        require(_admin != address(0));
        Admins[_admin] = true;
        numberOfAdmins++;
        emit eNewAdminAdded(_admin);
    }

    function removeAdmin(address _admin)
        public onlyOwner {
        require(_admin != address(0));
        require(_admin != Owner);
        Admins[_admin] = false;
        numberOfAdmins--;
        emit eAdminRemoved(_admin);
    }

    function isAdmin(address _candidate) public view returns (bool) {
        return Admins[_candidate];
    }

    function registerIssuer(address _issuer, string _issuerName, string _issuerWebDomain)
        public onlyAdmin {
        require(Issuers[_issuer].issuer == address(0));
        require(Issuers[_issuer].issuer != _issuer);
        Issuers[_issuer].issuer = _issuer;
        Issuers[_issuer].issuerName = _issuerName;
        Issuers[_issuer].issuerWebDomain = _issuerWebDomain;
        issuersList.push(_issuer);
        emit eNewIssuerRegistered(_issuer, _issuerName, _issuerWebDomain);
    }

    function getIssuerName(address _issuer) public view returns (string) {
        return Issuers[_issuer].issuerName;
    }

    function getIssuerData(address _issuer) public view returns (string, string) {
        return (Issuers[_issuer].issuerName, Issuers[_issuer].issuerWebDomain);
    }

    function getIssuersList() public view returns (address[]){
        return issuersList;
    }

    function getNumberOfIssuers() public view returns (uint256) {
        return issuersList.length;
    }
    
    // DiplomaHash => DiplomaDetails
    // DiplomaDetails should be a sha256 hash of ASCII-string
    // with ';' separator of values of the fields:
    //    address issuer; as string "0x...."
    //    string  studentName;
    //    string  diplomaDate;
    //    string  diplomaId;
    function registerDiploma(string _diplomaData) onlyIssuer public returns (bytes32) {
        bytes32 diplomaHash = sha256(abi.encodePacked(_diplomaData));
        require(Diplomas[diplomaHash] == address(0));
        Diplomas[diplomaHash] = msg.sender;
        numberOfDiplomas++;
        emit eNewDiplomaRegistered(msg.sender, diplomaHash);
        return diplomaHash;
    }

    function checkDiploma(string _diplomaData) public view returns (address) {
        bytes32 diplomaHash = sha256(abi.encodePacked(_diplomaData));
        return Diplomas[diplomaHash];
    }

    function registerDiplomaByHash(bytes32 _diplomaHash)
        public onlyIssuer {
        bytes32 diplomaHash = _diplomaHash;
        require(Diplomas[diplomaHash] == address(0));
        Diplomas[diplomaHash] = msg.sender;
        numberOfDiplomas++;
        emit eNewDiplomaRegistered(msg.sender, diplomaHash);
    }

    function checkDiplomaByHash(bytes32 _diplomaHash) public view returns (address) {
        return Diplomas[_diplomaHash];
    }

    function() external payable {
        require(false);
    }

}