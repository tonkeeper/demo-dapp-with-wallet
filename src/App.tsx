import './App.scss';
import './trackers';
import {
    RequiredFeatures,
    THEME,
    TonConnectUIProvider,
} from '@tonconnect/ui-react';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { TxForm } from './components/TxForm/TxForm';
import { ConnectionButton } from './components/ConnectionButton/ConnectionButton';
import { SignDataForm } from './components/SignDataForm/SignDataForm';

const walletsRequiredFeatures: RequiredFeatures = {
    sendTransaction: {
        extraCurrencyRequired: true,
    },
    // signData: {
    //     types: ['text', 'binary', 'cell']
    // },
};

function App() {
    return (
        <TonConnectUIProvider
            manifestUrl="https://ton-connect.github.io/demo-dapp-with-wallet/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.DARK }}
            // walletsRequiredFeatures={walletsRequiredFeatures}
            walletsPreferredFeatures={walletsRequiredFeatures}
        >
            <div className="app">
                <Header />
                <TxForm />
                <SignDataForm />
                {/*<TonProofDemo />*/}
                <ConnectionButton />
                <Footer />
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
