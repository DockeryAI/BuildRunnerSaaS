```swift
import SwiftUI
import Foundation

/// Instagram API authentication configuration
struct InstagramConfig {
    static let clientId = "YOUR_CLIENT_ID"
    static let clientSecret = "YOUR_CLIENT_SECRET"
    static let redirectUri = "YOUR_REDIRECT_URI"
    static let scope = "user_profile,user_media"
}

/// Instagram authentication response model
struct InstagramAuthResponse: Codable {
    let accessToken: String
    let userId: String
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case userId = "user_id"
    }
}

/// Instagram API errors
enum InstagramError: Error {
    case invalidCode
    case networkError
    case invalidResponse
    case authenticationFailed
}

/// Instagram authentication view model
class InstagramAuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var error: InstagramError?
    
    private var accessToken: String?
    
    func authenticate(code: String) async {
        do {
            let tokenResponse = try await getAccessToken(code: code)
            DispatchQueue.main.async {
                self.accessToken = tokenResponse.accessToken
                self.isAuthenticated = true
            }
        } catch let error as InstagramError {
            DispatchQueue.main.async {
                self.error = error
            }
        } catch {
            DispatchQueue.main.async {
                self.error = .networkError
            }
        }
    }
    
    private func getAccessToken(code: String) async throws -> InstagramAuthResponse {
        guard let url = URL(string: "https://api.instagram.com/oauth/access_token") else {
            throw InstagramError.invalidCode
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let parameters = [
            "client_id": InstagramConfig.clientId,
            "client_secret": InstagramConfig.clientSecret,
            "grant_type": "authorization_code",
            "redirect_uri": InstagramConfig.redirectUri,
            "code": code
        ]
        
        request.httpBody = parameters
            .map { "\($0.key)=\($0.value)" }
            .joined(separator: "&")
            .data(using: .utf8)
        
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw InstagramError.authenticationFailed
        }
        
        let decoder = JSONDecoder()
        guard let authResponse = try? decoder.decode(InstagramAuthResponse.self, from: data) else {
            throw InstagramError.invalidResponse
        }
        
        return authResponse
    }
}

/// Instagram login view
struct InstagramLoginView: View {
    @StateObject private var viewModel = InstagramAuthViewModel()
    @State private var showWebView = false
    
    private var authURL: URL? {
        let baseURL = "https://api.instagram.com/oauth/authorize"
        let queryItems = [
            "client_id": InstagramConfig.clientId,
            "redirect_uri": InstagramConfig.redirectUri,
            "scope": InstagramConfig.scope,
            "response_type": "code"
        ]
        .map { "\($0.key)=\($0.value)" }
        .joined(separator: "&")
        
        return URL(string: "\(baseURL)?\(queryItems)")
    }
    
    var body: some View {
        VStack {
            if viewModel.isAuthenticated {
                Text("Successfully authenticated with Instagram!")
                    .foregroundColor(.green)
            } else {
                Button("Login with Instagram") {
                    showWebView = true
                }
                .sheet(isPresented: $showWebView) {
                    if let url = authURL {
                        InstagramWebView(url: url) { code in
                            showWebView = false
                            Task {
                                await viewModel.authenticate(code: code)
                            }
                        }
                    }
                }
            }
            
            if let error = viewModel.error {
                Text(String(describing: error))
                    .foregroundColor(.red)
            }
        }
    }
}

/// Instagram WebView for OAuth
struct InstagramWebView: UIViewControllerRepresentable {
    let url: URL
    let onCodeReceived: (String) -> Void
    
    func makeUIViewController(context: Context) -> InstagramWebViewController {
        let controller = InstagramWebViewController(url: url)
        controller.delegate = context.coordinator
        return controller
    }
    
    func updateUIViewController(_ uiViewController: InstagramWebViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(onCodeReceived: onCodeReceived)
    }
    
    class Coordinator: InstagramWebViewDelegate {
        let onCodeReceived: (String) -> Void
        
        init(onCodeReceived: @escaping (String) -> Void) {
            self.onCodeReceived = onCodeReceived
        }
        
        func didReceiveCode(_ code: String) {
            onCodeReceived(code)
        }
    }
}

protocol InstagramWebViewDelegate: AnyObject {
    func didReceiveCode(_ code: String)
}

class InstagramWebViewController: UIViewController, WKNavigationDelegate {
    private let webView: WKWebView
    weak var delegate: InstagramWebViewDelegate?
    
    init(url: URL) {
        webView = WKWebView(frame: .zero)
        super.init(nibName: nil, bundle: nil)
        webView.navigationDelegate = self
        webView.load(URLRequest(url: url))
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(webView)
        webView.frame = view.bounds
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url,
           url.absoluteString.starts(with: InstagramConfig.redirectUri),
           let code = URLComponents(string: url.absoluteString)?.queryItems?.first(where: { $0.name == "code" })?.value {
            delegate?.didReceiveCode(code)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }
}
```