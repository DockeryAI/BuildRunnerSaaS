/**
 * Component that provides instructions for installing Xcode and iOS Simulator
 * @returns React component with installation steps
 */
const InstallXcodeAndSimulator: React.FC = () => {
  /**
   * Opens Mac App Store link for Xcode in new window
   */
  const openAppStore = () => {
    window.open('macappstore://apps.apple.com/app/xcode/id497799835', '_blank');
  };

  return (
    <div className="install-xcode-container">
      <h2>Install Xcode and iOS Simulator</h2>
      
      <div className="installation-steps">
        <h3>Prerequisites</h3>
        <ul>
          <li>A Mac computer running macOS 10.15.4 or later</li>
          <li>At least 40GB of available disk space</li>
          <li>Apple ID account</li>
        </ul>

        <h3>Installation Steps</h3>
        <ol>
          <li>
            <strong>Install Xcode</strong>
            <p>Open the Mac App Store and search for Xcode or click the button below:</p>
            <button 
              onClick={openAppStore}
              className="app-store-button"
            >
              Open in Mac App Store
            </button>
          </li>

          <li>
            <strong>Accept Xcode License</strong>
            <p>Open Terminal and run:</p>
            <code>sudo xcodebuild -license accept</code>
          </li>

          <li>
            <strong>Install Command Line Tools</strong>
            <p>In Terminal, run:</p>
            <code>xcode-select --install</code>
          </li>

          <li>
            <strong>Launch Xcode</strong>
            <p>Open Xcode and accept any additional installations when prompted</p>
          </li>

          <li>
            <strong>Install iOS Simulator</strong>
            <p>
              1. Open Xcode<br/>
              2. Go to Xcode → Preferences → Components<br/>
              3. Download the iOS Simulator version you need
            </p>
          </li>
        </ol>

        <div className="verification">
          <h3>Verify Installation</h3>
          <p>To verify the installation, open Terminal and run:</p>
          <code>xcode-select -p</code>
          <p>This should return the path to your Xcode installation.</p>
        </div>

        <div className="troubleshooting">
          <h3>Troubleshooting</h3>
          <ul>
            <li>If Xcode download fails, try downloading directly from the <a href="https://developer.apple.com/download/applications/" target="_blank" rel="noopener noreferrer">Apple Developer website</a></li>
            <li>For Command Line Tools issues, try removing and reinstalling:
              <code>sudo rm -rf /Library/Developer/CommandLineTools</code>
              Then run <code>xcode-select --install</code> again
            </li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .install-xcode-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .installation-steps {
          margin-top: 20px;
        }

        code {
          display: block;
          background-color: #f5f5f5;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
          font-family: monospace;
        }

        .app-store-button {
          background-color: #0071e3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin: 10px 0;
        }

        .app-store-button:hover {
          background-color: #0077ed;
        }

        ul, ol {
          padding-left: 20px;
        }

        li {
          margin-bottom: 15px;
        }

        .verification, .troubleshooting {
          margin-top: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }

        a {
          color: #0071e3;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default InstallXcodeAndSimulator;