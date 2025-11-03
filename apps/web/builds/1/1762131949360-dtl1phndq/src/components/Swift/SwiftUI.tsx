```swift
import SwiftUI
import Foundation

/// Instagram API authentication and data fetching service
class InstagramService: ObservableObject {
    /// Published properties for state management
    @Published var isAuthenticated = false
    @Published var error: Error?
    @Published var posts: [InstagramPost] = []
    
    /// Instagram API credentials
    private let clientId: String
    private let clientSecret: String
    private let redirectUri: String
    private var accessToken: String?
    
    init(clientId: String, clientSecret: String, redirectUri: String) {
        self.clientId = clientId
        self.clientSecret = clientSecret 
        self.redirectUri = redirectUri
    }
    
    /// Instagram Post model
    struct InstagramPost: Codable, Identifiable {
        let id: String
        let mediaType: String
        let mediaUrl: String
        let permalink: String
        let caption: String?
        let timestamp: String
        
        enum CodingKeys: String, CodingKey {
            case id
            case mediaType = "media_type"
            case mediaUrl = "media_url"
            case permalink
            case caption
            case timestamp
        }
    }
    
    /// Authenticate with Instagram
    func authenticate() async throws {
        let authUrl = "https://api.instagram.com/oauth/authorize?client_id=\(clientId)&redirect_uri=\(redirectUri)&scope=user_profile,user_media&response_type=code"
        
        guard let url = URL(string: authUrl) else {
            throw InstagramError.invalidUrl
        }
        
        // Handle auth callback and token exchange
        // Store access token
        self.isAuthenticated = true
    }
    
    /// Fetch recent Instagram posts
    func fetchPosts() async throws {
        guard let accessToken = accessToken else {
            throw InstagramError.notAuthenticated
        }
        
        let endpoint = "https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=\(accessToken)"
        
        guard let url = URL(string: endpoint) else {
            throw InstagramError.invalidUrl
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw InstagramError.invalidResponse
        }
        
        struct Response: Codable {
            let data: [InstagramPost]
        }
        
        let decoder = JSONDecoder()
        let result = try decoder.decode(Response.self, from: data)
        
        DispatchQueue.main.async {
            self.posts = result.data
        }
    }
}

/// Custom Instagram errors
enum InstagramError: Error {
    case invalidUrl
    case notAuthenticated
    case invalidResponse
}

/// Instagram feed view
struct InstagramFeedView: View {
    @StateObject private var instagramService = InstagramService(
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET", 
        redirectUri: "YOUR_REDIRECT_URI"
    )
    
    var body: some View {
        NavigationView {
            Group {
                if instagramService.isAuthenticated {
                    List(instagramService.posts) { post in
                        VStack(alignment: .leading) {
                            AsyncImage(url: URL(string: post.mediaUrl)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                            } placeholder: {
                                ProgressView()
                            }
                            
                            if let caption = post.caption {
                                Text(caption)
                                    .padding(.vertical)
                            }
                            
                            Text(post.timestamp)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                } else {
                    Button("Connect Instagram") {
                        Task {
                            do {
                                try await instagramService.authenticate()
                                try await instagramService.fetchPosts()
                            } catch {
                                instagramService.error = error
                            }
                        }
                    }
                }
            }
            .navigationTitle("Instagram Feed")
            .alert("Error", isPresented: .constant(instagramService.error != nil)) {
                Button("OK") {
                    instagramService.error = nil
                }
            } message: {
                if let error = instagramService.error {
                    Text(error.localizedDescription)
                }
            }
        }
    }
}

struct InstagramFeedView_Previews: PreviewProvider {
    static var previews: some View {
        InstagramFeedView()
    }
}
```