import React, {useState,useEffect} from 'react';
import {ethers} from 'ethers';



const Healthcare = ()=>{

    //use usestate
    const [provider,setprovider] = useState(null);
    const [providerAddress,setproviderAddress] = useState("");

    const [signer,setsigner] = useState(null);

    const [account,setaccount] = useState(null);
    
    const [contract,setcontract] = useState(null);
    const [isowner,setisowner] = useState(null);

    const [patientID,setpatientID] = useState('');
    const [diagnosis,setdiagnosis] =useState('');
    const [treatment,settreatment] = useState('');
    const [patientRecords,setpatientRecord] = useState([]);   //take records in array
    
    const contractAddress = "0xaa8952425a474566fd646fa00f26349e5e3bb37c";
    const contractABI =  [
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "patientID",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "patientName",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "diagnosis",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "treatment",
                        "type": "string"
                    }
                ],
                "name": "addRecord",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "provider",
                        "type": "address"
                    }
                ],
                "name": "authorizeProvider",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [],
                "name": "getOwner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "patientID",
                        "type": "uint256"
                    }
                ],
                "name": "getPatientRecords",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "recordID",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "patientName",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "diagnosis",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "treatment",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "timestamp",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct HealthcareRecords.Record[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
    ];

    useEffect( () =>{

        const connectWallet = async()=>{
            try{
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts',[]);    //user connection with metamask and get account
                const signer = provider.getSigner();
                setprovider(provider);
                setsigner(signer);

                const accountAddress = await signer.getAddress();   //getting signer account address
                setaccount(accountAddress);

                console.log("Account address is ",accountAddress);

                const contract = new ethers.Contract(contractAddress,contractABI,signer);
                setcontract(contract);

                const owneraddress = await contract.getOwner();     //getting owner of contract
                setisowner(accountAddress.toLowerCase() === owneraddress.toLowerCase());


            }
            catch(error){
                console.error("Not able to connect with wallet: ",error);
            }
        }
        connectWallet();

    },[]);

    const authorizeProvider = async () => {
        if (isowner){
            try {
                const tx = await contract.authorizeProvider(providerAddress);
                await tx.wait();
                alert(`Provider ${providerAddress} authorized successfully`);

            } catch(error) {
                console.error("Only contract owner can authorize different providers");
            }
        } else {
            alert("Only contract owner can call this function");
        }
    }

    const addRecord = async () => {
        try {
            const tx = await contract.addRecord(patientID, "Alice", diagnosis, treatment);
            await tx.wait();
            fetchPatientRecords();
            await tx.wait();
            alert(`Provider ${providerAddress} authorized successfully`);

        } catch(error) {
            console.error("Error adding records", error);
        }

    }

    const fetchPatientRecords = async () => {
        try {
            const records = await contract.getPatientRecords(patientID);
            console.log(records);
            setpatientRecord(records);

        } catch(error) {
            console.error("Error fetching patient records", error);
        }
    }


    return(
        <div className='container'>
            <h1 className = "title">HealthCare Dapp</h1>
            {account && <p className='account-info'>Connected Account number is: {account}</p>}
            {isowner && <p className='owner-info'>You are the contract owner</p>}
            {!isowner && <p className='owner-info'>You are not contract owner,</p>}

        <div className="form-section">
            <h2>Authorize HealthCare Provider</h2>
            <input className='input-field' type= "text" placeholder='Provider Address' value = {providerAddress} onChange={(e) => setproviderAddress(e.target.value)}/>
            <button className='action-button' onClick={authorizeProvider}>Authorize Provider</button>
        </div>    


        <div className="form-section">
            <h2>Add Patient Record</h2>
            <input className='input-field' type='text' placeholder='Diagnosis' value={diagnosis} onChange={(e) => setdiagnosis(e.target.value)}/>
            <input className='input-field' type='text' placeholder='Treatment' value={treatment} onChange={(e) => settreatment(e.target.value)}/>
            <button className='action-button' onClick={addRecord}>Add Records</button>

        </div>

        <div className='form-section'>
            <h2>Fetch Patient Records</h2>
            <input className='input-field' type='text' placeholder='Enter Patient ID' value={patientID} onChange={(e) => setpatientID(e.target.value)}/>
            <button className='action-button' onClick={fetchPatientRecords}>Fetch Records</button>
        </div>

        <div className='records-section'>
            <h2>Patient Records</h2>
            {patientRecords.map((record, index) => (
                <div key = {index}>
                    <p>Record ID: {record.recordID.toNumber()}</p>
                    <p>Diagnosis: {record.diagnosis}</p>
                    <p>Treatment: {record.treatment}</p>
                    <p>Timestamp: {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</p>
                </div>
            ))}
        </div>

        </div>

    )

}
    
export default Healthcare;