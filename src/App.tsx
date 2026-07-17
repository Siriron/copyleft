import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { useWallet } from './lib/useCopyleft';
import { DEFAULT_NETWORK, NetworkKey } from './config/chains';

import Home from './pages/Home';
import Disputes from './pages/Disputes';
import DisputeDetail from './pages/DisputeDetail';
import FileDispute from './pages/FileDispute';
import Docs from './pages/Docs';
import NotFound from './pages/NotFound';

export default function App() {
  const [network, setNetwork] = useState<NetworkKey>(DEFAULT_NETWORK);
  const { account, connect, connecting } = useWallet();

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar
          network={network}
          onNetworkChange={setNetwork}
          account={account}
          onConnect={connect}
          connecting={connecting}
        />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/disputes" element={<Disputes network={network} />} />
            <Route path="/disputes/:id" element={<DisputeDetail network={network} account={account} onConnect={connect} />} />
            <Route path="/file" element={<FileDispute network={network} account={account} onConnect={connect} />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:section" element={<Docs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
