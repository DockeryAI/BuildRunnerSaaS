```swift
import SwiftUI
import Foundation

/// Configuration for Instagram API authentication
struct InstagramConfig {
    static let clientId = "YOUR_CLIENT_ID"
    static let clientSecret = "YOUR_CLIENT_SECRET"
    static let redirectUri = "YOUR_REDIRECT_URI"
    static let scope = "user_profile,user_media"
}

/// Model representing Instagram authentication response
struct InstagramAuthResponse: Codable {
    let accessToken: String
    let userId: String
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case userId = "user_id"
    }
}

/// Model representing Instagram API errors
struct InstagramError: Error {
    let message: String
    let code: Int
}

/// Main Instagram authentication view
struct InstagramAuthView: View {
    @State private var isAuthenticated = false
    @State private var error: InstagramError?
    @State private var isLoading = false
    
    private let instagramAuthURL: URL = {
        var components = URLComponents()
        components.scheme = "https"
        components.host = "api.instagram.com"
        components.path = "/oauth/authorize"
        components.queryItems = [
            URLQueryItem(name: "client_id", value: InstagramConfig.clientId),
            URLQueryItem(name: "redirect_uri", value: InstagramConfig.redirectUri),
            URLQueryItem(name: "scope", value: InstagramConfig.scope),
            URLQueryItem(name: "response_type", value: "code")
        ]
        return components.url!
    }()
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
            } else if isAuthenticated {
                Text("Successfully authenticated with Instagram!")
                    .foregroundColor(.green)
            } else {
                Button(action: authenticate) {
                    HStack {
                        Image(systemName: "camera")
                        Text("Connect Instagram")
                    }
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }
            
            if let error = error {
                Text(error.message)
                    .foregroundColor(.red)
                    .padding()
            }
        }
    }
    
    /// Initiates the Instagram authentication flow
    private func authenticate() {
        isLoading = true
        
        UIApplication.shared.open(instagramAuthURL) { success in
            if !success {
                self.error = InstagramError(
                    message: "Failed to open Instagram authorization page",
                    code: -1
                )
            }
            self.isLoading = false
        }
    }
    
    /// Handles the Instagram OAuth callback
    /// - Parameter url: The callback URL containing the authorization code
    func handleCallback(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let code = components.queryItems?.first(where: { $0.name == "code" })?.value
        else {
            self.error = InstagramError(message: "Invalid callback URL", code: -1)
            return
        }
        
        exchangeCodeForToken(code)
    }
    
    /// Exchanges authorization code for access token
    /// - Parameter code: The authorization code from Instagram
    private func exchangeCodeForToken(_ code: String) {
        isLoading = true
        
        var request = URLRequest(url: URL(string: "https://api.instagram.com/oauth/access_token")!)
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
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isLoading = false
                
                if let error = error {
                    self.error = InstagramError(message: error.localizedDescription, code: -1)
                    return
                }
                
                guard let data = data else {
                    self.error = InstagramError(message: "No data received", code: -1)
                    return
                }
                
                do {
                    let response = try JSONDecoder().decode(InstagramAuthResponse.self, from: data)
                    self.isAuthenticated = true
                    // Store access token securely here
                    UserDefaults.standard.set(response.accessToken, forKey: "instagram_access_token")
                } catch {
                    self.error = InstagramError(message: "Failed to parse response", code: -1)
                }
            }
        }.resume()
    }
}

#if DEBUG
struct InstagramAuthView_Previews: PreviewProvider {
    static var previews: some View {
        InstagramAuthView()
    }
}
#endif
```