import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactJson from 'react-json-view';
import './style.scss';
import {
    Message,
    SendTransactionRequest,
    useRuntimeConfig,
    useTonConnectUI,
    useTonWallet,
} from '@tonconnect/ui-react';
import { Address, beginCell, Cell, contractAddress, toNano } from '@ton/core';

const usdtJettonMaster = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const defaultReceiver = 'UQAZZNjwN-h6UbWmu1P10bG-p-_N_JSjGdunix4cMFdqsNQh';
const defaultSender = 'UQA99gDCBAhqx9Dhh2-elulwC50Y6YdUd_wM_mT2LNKrytdE';

function packJettonBoc({
    excessAddress,
    toJettonWallet,
    to,
    amount,
}: {
    excessAddress: string;
    toJettonWallet: string;
    to: string;
    amount: number | bigint;
}): { payload: string; address: string; amount: string } {
    const jettonTransfer = beginCell()
        .storeUint(0xf8a7ea5, 32) // request_transfer op
        .storeUint(0, 64)
        .storeCoins(amount)
        .storeAddress(Address.parse(to))
        .storeAddress(Address.parse(excessAddress))
        .storeBit(false) // null custom_payload
        .storeCoins(toNano('0.01'))
        .storeBit(false) // forward_payload in this slice, not separate cell
        .endCell();

    return {
        payload: jettonTransfer.toBoc().toString('base64'),
        address: toJettonWallet,
        amount: '70000000',
    };
}

function buildInitDataForUSDT(owner: string, master: string): string {
    return beginCell()
        .storeUint(0, 4) // status
        .storeCoins(0n)
        .storeAddress(Address.parse(owner))
        .storeAddress(Address.parse(master))
        .endCell()
        .toBoc()
        .toString('base64');
}

function getUSDTWalletAddress(owner: string): string {
    const walletCodeBase64 =
        'te6ccgEBAQEAIwAIQgKPRS16Tf10BmtoI2UXclntBXNENb52tf1L1divK3w9aA==';
    const jettonMaster = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

    const codeCell = Cell.fromBase64(walletCodeBase64);
    const initData = buildInitDataForUSDT(owner, jettonMaster);
    const dataCell = Cell.fromBase64(initData);
    const masterAddr = Address.parse(jettonMaster);

    const wallet = contractAddress(masterAddr.workChain, {
        code: codeCell,
        data: dataCell,
    });
    return wallet.toString();
}

function buildJettonMessage({
    sender,
    receiver,
    excessAddress = sender,
}: {
    sender: string;
    receiver: string;
    excessAddress?: string;
}): Message {
    return {
        address: sender,
        amount: toNano('0.01').toString(),
        payload: packJettonBoc({
            toJettonWallet: getUSDTWalletAddress(sender),
            to: receiver,
            amount: 1,
            excessAddress: excessAddress,
        }).payload,
    };
}

function buildVariantsTx({
    sender,
    receiver,
    batteryExcessAddresses,
}: {
    sender: string;
    receiver: string;
    batteryExcessAddresses?: string[];
}): SendTransactionRequest {
    const batteryExcess = batteryExcessAddresses?.[0];

    return {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [buildJettonMessage({ sender, receiver })],
        messagesVariants: {
            ...(batteryExcess
                ? {
                      battery: {
                          messages: [
                              buildJettonMessage({
                                  sender,
                                  receiver,
                                  excessAddress: batteryExcess,
                              }),
                          ],
                      },
                  }
                : {}),
            gasless: {
                messages: [buildJettonMessage({ sender, receiver })],
                options: {
                    asset: usdtJettonMaster,
                },
            },
            castodial: {
                messages: [buildJettonMessage({ sender, receiver })],
            },
        },
    } as SendTransactionRequest;
}

function buildBasicTx({
    receiver,
}: {
    receiver: string;
}): SendTransactionRequest {
    return {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
            {
                address: receiver,
                amount: '5000000',
                stateInit:
                    'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==',
                payload: 'te6ccsEBAQEADAAMABQAAAAASGVsbG8hCaTc/g==',
            },
        ],
    } as SendTransactionRequest;
}

export function TxForm() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();
    const [variant, setVariant] = useState<'basic' | 'variants'>('basic');
    const runtimeConfig = useRuntimeConfig();

    const [tx, setTx] = useState<SendTransactionRequest>(() =>
        buildBasicTx({
            receiver: defaultReceiver,
        })
    );

    useEffect(() => {
        const newTx =
            variant === 'basic'
                ? buildBasicTx({ receiver: defaultReceiver })
                : buildVariantsTx({
                      sender: defaultSender,
                      receiver: defaultReceiver,
                      batteryExcessAddresses:
                          runtimeConfig?.batteryExcessAddresses,
                  });
        setTx(newTx);
    }, [variant, runtimeConfig]);

    const onChange = useCallback((value: object) => {
        setTx((value as { updated_src: SendTransactionRequest }).updated_src);
    }, []);

    return (
        <div className="send-tx-form">
            <h3>Configure and send transaction</h3>
            {/* <h4>Transaction</h4> */}
            <div className="template-buttons">
                <button onClick={() => setVariant('basic')}>Basic</button>
                <button onClick={() => setVariant('variants')}>Variants</button>
            </div>
            <ReactJson
                name={false}
                src={tx}
                theme="ocean"
                onEdit={onChange}
                onAdd={onChange}
                onDelete={onChange}
            />
            {wallet && (
                <button
                    onClick={() =>
                        tonConnectUi.sendTransaction(tx).then(console.log)
                    }
                >
                    Send transaction
                </button>
            )}
        </div>
    );
}
