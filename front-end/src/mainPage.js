import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Mainpage(props) {

    const [marbles, setmarbles] = useState([]);
    const [org, setOrg] = useState("Org1");
    const [loading, setloading] = useState();

    useEffect(() => {
        getAllMarbles();
    }, []);

    useEffect(() => {
        setloading(true);
        axios.post("http://localhost:4000/switchOrg", {}, {
            headers: { org }
        })
            .then(res => {
                getAllMarbles();
                setloading(false);
            })
            .catch(error => {
                console.log("request failed");
            });
    }, [org]);

    let getAllMarbles = () => {
        setloading(true);
        axios.get("http://localhost:4000/getAllMarbles")
            .then(res => {
                setmarbles(res.data.filter(marble => marble["Record"]["currentOwner"] === org));
                setloading(false);
            })
            .catch(error => {
                console.log("request failed");
            });
    }

    let sellMarble = (id, currentOwner) => {
        setloading(true);
        let owner = "Org1";
        if (currentOwner === "Org1")
            owner = "Org2";
        else if (currentOwner === "Org2")
            owner = "Org1";

        let headers = {
            id: id,
            org: owner
        }
        axios.post("http://localhost:4000/sellMarble", {}, {
            headers: headers
        })
            .then(res => {
                getAllMarbles();
                setloading(false);
            })
            .catch(error => {
                console.log("request failed");
            });
    }

    let createNewMarble = (id) => {
        setloading(true);
        console.log(id);
        let headers = {
            "id": id
        }
        axios.post("http://localhost:4000/manufacture", {}, {
            headers: headers
        })
            .then(res => {
                getAllMarbles();
                setloading(false);
            })
            .catch(error => {
                console.log("request failed");
            });
    }

    let switchOrg = (event) => {
        let org = event.target.value;
        setOrg(org);
    }

    return (
        <div>
            <div>
                { loading ? <Spinner animation="border" variant="dark" /> : null }
                <select className="switchOrg" onChange={switchOrg}>
                    <option>Org1</option>
                    <option>Org2</option>
                </select>
            </div>
            <div className="marbles">
                {marbles.map((marble, index) => {
                    return (
                        <div key={index} style={{ float: "left", marginLeft: "20px", marginRight: "20px", width: "12%", marginBottom: "55px" }} >
                            <div className={marble["Record"]["manufacturedBy"] === "Org1" ? "red" : "blue"}><button className="button" onClick={() => sellMarble(marble["Record"]["id"], marble["Record"]["currentOwner"])}>Sell</button></div>
                            <div>{marble["Record"]["marbleName"]}</div>
                        </div>)
                })}
            </div>
            <div className="button createNew" onClick={() => createNewMarble(new Date().getTime())}>Create New Marble</div>
        </div>
    )
}
