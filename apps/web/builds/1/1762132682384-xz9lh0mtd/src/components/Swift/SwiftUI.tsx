```swift
import SwiftUI
import Foundation

/// Instagram authentication and API interaction manager
class InstagramManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var error: Error?
    
    private let clientId: String
    private let clientSecret: String
    private let redirectUri: String
    private var accessToken: String?
    
    private enum InstagramError: Error {
        case invalidCode
        case networkError
        case authenticationFailed
    }
    
    init(clientId: String, clientSecret: String, redirectUri: String) {
        self.clientId = clientId
        self.clientSecret = clientSecret 
        self.redirectUri = redirectUri
    }
    
    func authenticate() {
        let urlString = "https://api.instagram.com/oauth/authorize?client_id=\(clientId)&redirect_uri=\(redirectUri)&scope=user_profile,user_media&response_type=code"
        
        guard let url = URL(string: urlString) else {
            self.error = InstagramError.invalidCode
            return
        }
        
        UIApplication.shared.open(url)
    }
    
    func handleAuthCallback(url: URL) async {
        guard let code = URLComponents(url: url, resolvingAgainstBaseURL: true)?
            .queryItems?
            .first(where: { $0.name == "code" })?
            .value
        else {
            self.error = InstagramError.invalidCode
            return
        }
        
        do {
            try await exchangeCodeForToken(code: code)
            self.isAuthenticated = true
        } catch {
            self.error = error
        }
    }
    
    private func exchangeCodeForToken(code: String) async throws {
        let tokenEndpoint = "https://api.instagram.com/oauth/access_token"
        
        guard let url = URL(string: tokenEndpoint) else {
            throw InstagramError.networkError
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let parameters = [
            "client_id": clientId,
            "client_secret": clientSecret,
            "grant_type": "authorization_code", 
            "redirect_uri": redirectUri,
            "code": code
        ]
        
        request.httpBody = parameters
            .map { "\($0.key)=\($0.value)" }
            .joined(separator: "&")
            .data(using: .utf8)
        
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw InstagramError.authenticationFailed
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        
        struct TokenResponse: Codable {
            let accessToken: String
            let userId: String
        }
        
        let tokenResponse = try decoder.decode(TokenResponse.self, from: data)
        self.accessToken = tokenResponse.accessToken
    }
    
    func fetchUserProfile() async throws -> InstagramProfile {
        guard let accessToken = accessToken else {
            throw InstagramError.authenticationFailed
        }
        
        let endpoint = "https://graph.instagram.com/me?fields=id,username&access_token=\(accessToken)"
        
        guard let url = URL(string: endpoint) else {
            throw InstagramError.networkError
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw InstagramError.networkError
        }
        
        return try JSONDecoder().decode(InstagramProfile.self, from: data)
    }
}

struct InstagramProfile: Codable {
    let id: String
    let username: String
}

struct InstagramLoginView: View {
    @StateObject private var instagramManager = InstagramManager(
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET",
        redirectUri: "your-app-scheme://oauth-callback"
    )
    
    var body: some View {
        VStack {
            if instagramManager.isAuthenticated {
                Text("Authenticated!")
            } else {
                Button("Login with Instagram") {
                    instagramManager.authenticate()
                }
            }
            
            if let error = instagramManager.error {
                Text("Error: \(error.localizedDescription)")
                    .foregroundColor(.red)
            }
        }
        .onOpenURL { url in
            Task {
                await instagramManager.handleAuthCallback(url: url)
            }
        }
    }
}

#Preview {
    InstagramLoginView()
}
```