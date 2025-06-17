import { useCallback, useState } from 'react';
import ReactJson from 'react-json-view';
import './style.scss';
import {
    CreateSubscriptionV2Request,
    CreateSubscriptionV2Response,
    useTonConnectUI,
    useTonWallet,
} from '@tonconnect/ui-react';

const baseSubscriptionPayload: CreateSubscriptionV2Request = {
    validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
    subscription: {
        beneficiary: 'UQCae11h9N5znylEPRjmuLYGvIwnxkcCw4zVW4BJjVASi5eL',
        id: '123e4567-e89b-12d3-a456-426614174000',
        period: 1209600, // 2 week
        amount: '100000000',
        // firstChargeDate: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        metadata: {
            logo: 'https://myapp.com/logo.png',
            name: 'Example Subscription',
            description: 'This is an example subscription service.',
            link: 'https://myapp.com',
            tos: 'https://myapp.com/tos',
            merchant: 'Example Merchant',
            website: 'https://myapp.com',
        },
    },
};

export function SubscriptionForm() {
    const [subscription, setSubscription] =
        useState<CreateSubscriptionV2Request>(baseSubscriptionPayload);
    const [subscriptionRes, setSubscriptionRes] =
        useState<CreateSubscriptionV2Response | null>(null);

    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();

    const onChange = useCallback((value: object) => {
        setSubscription(
            (value as { updated_src: typeof subscription }).updated_src
        );
    }, []);

    // const loadTemplate = (template: CreateSubscriptionV2Request) => {
    //     setSubscription(template);
    // };

    const onSend = () =>
        tonConnectUi
            .createSubscription(subscription, { version: 'v2' })
            .then((res) => setSubscriptionRes(res));

    return (
        <div className="create-subscription-form">
            <h3>Configure and create subsciption</h3>
            <h4>Subscription data </h4>

            {/* <div className="template-buttons">
                <button onClick={() => loadTemplate(defaultTextData)}>
                    Text
                </button>
                <button onClick={() => loadTemplate(defaultBinaryData)}>
                    Binary
                </button>
                <button onClick={() => loadTemplate(defaultCellData)}>
                    Cell
                </button>
            </div> */}
            <ReactJson
                name={false}
                src={subscription}
                theme="ocean"
                onEdit={onChange}
                onAdd={onChange}
                onDelete={onChange}
            />
            {subscriptionRes && (
                <>
                    <h4>Create subscription response</h4>
                    <ReactJson
                        name={false}
                        src={subscriptionRes}
                        theme="ocean"
                    />
                </>
            )}
            {wallet && (
                <div className="buttons-container">
                    <button onClick={onSend}>Create subscription</button>
                    {subscriptionRes && <button>Cancel subscription</button>}
                </div>
            )}
        </div>
    );
}
