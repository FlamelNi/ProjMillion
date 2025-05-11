import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";
import { format } from "date-fns";

const localizer = momentLocalizer(moment);

interface Coin {
  name: string;
  balance: number;
  price: number;
}

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [coinData, setCoinData] = useState<Record<string, Coin>>({
    Bitcoin: { name: "Bitcoin", balance: 0, price: 0 },
    Ethereum: { name: "Ethereum", balance: 0, price: 0 },
    Dogecoin: { name: "Dogecoin", balance: 0, price: 0 },
  });

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  const handleCoinClick = (coinName: string) => {
    setSelectedCoin(coinName);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCoin(null);
    setShowModal(false);
  };

  return (
    <div className="container mt-5">
      <Button variant="danger" className="mb-4 w-100" onClick={handleLogout}>
        Logout
      </Button>
      <div className="d-flex justify-content-around mb-4">
        <Button variant="warning" onClick={() => handleCoinClick("Bitcoin")}>
          Bitcoin
        </Button>
        <Button variant="primary" onClick={() => handleCoinClick("Ethereum")}>
          Ethereum
        </Button>
        <Button variant="info" onClick={() => handleCoinClick("Dogecoin")}>
          Dogecoin
        </Button>
      </div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCoin} Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Current Balance: {selectedCoin ? coinData[selectedCoin].balance : 0} {selectedCoin}
          </p>
          <p>Current Price: ${selectedCoin ? coinData[selectedCoin].price : 0.0}</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" placeholder="Enter amount" />
            </Form.Group>
            <Button variant="success" className="me-2">
              Buy
            </Button>
            <Button variant="danger">Sell</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
