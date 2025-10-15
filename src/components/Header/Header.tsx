import {TonConnectButton as TonConnectButtonOriginal} from "@tonconnect/ui-react";
import './header.scss';

export const Header = () => {
    const TonConnectButton = TonConnectButtonOriginal as any;
    return <header>
        <span>TonConnect React reference</span>
        <TonConnectButton />
    </header>
}
