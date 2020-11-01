
# echo "--------env to use peer----------------"
# export PATH=${PWD}/./bin:$PATH
# export FABRIC_CFG_PATH=$PWD/config/
# export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
# peer lifecycle chaincode package basic_24.tar.gz --path ./asset-transfer-basic/chaincode-javascript/ --lang node --label basic_24.0

# echo "--------env to run as org1----------------"
# export CORE_PEER_TLS_ENABLED=true
# export CORE_PEER_LOCALMSPID="Org1MSP"
# export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
# export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
# export CORE_PEER_ADDRESS=localhost:7051

# echo "--------all env set----------------"
# echo "--------installing chain code on org1 peer----------------"
# peer lifecycle chaincode install basic_24.tar.gz
# echo "--------installing done----------------"
# peer lifecycle chaincode queryinstalled

# -----------------------------set NEW_CC_PACKAGE_ID-----------------------------------------------

echo "--------approving chaincode org1----------------"
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 24.0 --package-id $NEW_CC_PACKAGE_ID --sequence 24 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "--------env to run as org2----------------"
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

echo "--------all env set----------------"
echo "--------installing chain code on org2 peer----------------"

peer lifecycle chaincode install basic_24.tar.gz

echo "--------installing done----------------"

echo "--------approving chaincode org2----------------"
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 24.0 --package-id $NEW_CC_PACKAGE_ID --sequence 24 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "--------check chain code commit readiness----------------"
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 24.0 --sequence 24 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json

echo "--------commiting chain code to channel----------------"
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name basic --version 24.0 --sequence 24 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt