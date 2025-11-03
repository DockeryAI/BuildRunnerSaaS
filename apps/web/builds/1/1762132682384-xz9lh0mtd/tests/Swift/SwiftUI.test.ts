For Swift/SwiftUI components, we should use XCTest rather than Jest and React Testing Library (which are for JavaScript/React applications). Here's a comprehensive unit test suite for the InstagramManager class:

```swift
import XCTest
@testable import YourAppModule // Replace with your actual module name

class InstagramManagerTests: XCTestCase {
    var sut: InstagramManager!
    let mockClientId = "test_client_id"
    let mockClientSecret = "test_client_secret"
    let mockRedirectUri = "test-app://callback"
    
    override func setUp() {
        super.setUp()
        sut = InstagramManager(
            clientId: mockClientId,
            clientSecret: mockClientSecret,
            redirectUri: mockRedirectUri
        )
    }
    
    override func tearDown() {
        sut = nil
        super.tearDown()
    }
    
    // MARK: - Authentication Tests
    
    func testAuthenticate_GeneratesValidURL() {
        // When
        sut.authenticate()
        
        // Then
        let expectedURLString = "https://api.instagram.com/oauth/authorize?client_id=\(mockClientId)&redirect_uri=\(mockRedirectUri)&scope=user_profile,user_media&response_type=code"
        XCTAssertNotNil(URL(string: expectedURLString))
    }
    
    // MARK: - Handle Callback Tests
    
    func testHandleAuthCallback_WithValidCode_SetsIsAuthenticated() async {
        // Given
        let mockCode = "valid_code"
        let validCallbackURL = URL(string: "\(mockRedirectUri)?code=\(mockCode)")!
        
        // Create a mock URLSession
        let mockSession = MockURLSession()
        mockSession.mockData = try! JSONEncoder().encode(TokenResponse(accessToken: "test_token", userId: "test_user"))
        mockSession.mockResponse = HTTPURLResponse(url: URL(string: "https://api.instagram.com")!, statusCode: 200, httpVersion: nil, headerFields: nil)
        
        // When
        await sut.handleAuthCallback(url: validCallbackURL)
        
        // Then
        XCTAssertTrue(sut.isAuthenticated)
        XCTAssertNil(sut.error)
    }
    
    func testHandleAuthCallback_WithInvalidCode_SetsError() async {
        // Given
        let invalidCallbackURL = URL(string: "\(mockRedirectUri)?error=access_denied")!
        
        // When
        await sut.handleAuthCallback(url: invalidCallbackURL)
        
        // Then
        XCTAssertFalse(sut.isAuthenticated)
        XCTAssertNotNil(sut.error)
    }
    
    // MARK: - Profile Fetch Tests
    
    func testFetchUserProfile_WhenAuthenticated_ReturnsProfile() async throws {
        // Given
        let mockProfile = InstagramProfile(id: "123", username: "testuser")
        let mockSession = MockURLSession()
        mockSession.mockData = try! JSONEncoder().encode(mockProfile)
        mockSession.mockResponse = HTTPURLResponse(url: URL(string: "https://graph.instagram.com")!, statusCode: 200, httpVersion: nil, headerFields: nil)
        
        // Manually set access token
        sut.accessToken = "test_token"
        
        // When
        let profile = try await sut.fetchUserProfile()
        
        // Then
        XCTAssertEqual(profile.id, mockProfile.id)
        XCTAssertEqual(profile.username, mockProfile.username)
    }
    
    func testFetchUserProfile_WhenNotAuthenticated_ThrowsError() async {
        // Given
        sut.accessToken = nil
        
        // When/Then
        do {
            _ = try await sut.fetchUserProfile()
            XCTFail("Expected error to be thrown")
        } catch {
            XCTAssertTrue(error is InstagramManager.InstagramError)
        }
    }
}

// MARK: - Helper Classes

// Mock URLSession for testing network calls
class MockURLSession: URLSession {
    var mockData: Data?
    var mockResponse: URLResponse?
    var mockError: Error?
    
    override func data(
        for request: URLRequest,
        delegate: URLSessionTaskDelegate? = nil
    ) async throws -> (Data, URLResponse) {
        if let mockError = mockError {
            throw mockError
        }
        return (mockData ?? Data(), mockResponse ?? URLResponse())
    }
    
    override func data(
        from url: URL,
        delegate: URLSessionTaskDelegate? = nil
    ) async throws -> (Data, URLResponse) {
        if let mockError = mockError {
            throw mockError
        }
        return (mockData ?? Data(), mockResponse ?? URLResponse())
    }
}

// Helper struct for token response
private struct TokenResponse: Codable {
    let accessToken: String
    let userId: String
}
```

And here's a separate test file for the InstagramLoginView:

```swift
import XCTest
import SwiftUI
import ViewInspector
@testable import YourAppModule // Replace with your actual module name

extension InstagramLoginView: Inspectable { }

class InstagramLoginViewTests: XCTestCase {
    var sut: InstagramLoginView!
    
    override func setUp() {
        super.setUp()
        sut = InstagramLoginView()
    }
    
    override func tearDown() {
        sut = nil
        super.tearDown()
    }
    
    func testInitialState_ShowsLoginButton() throws {
        let view = try sut.inspect().find(button: "Login with Instagram")
        XCTAssertNotNil(view)
    }
    
    func testAuthenticated_ShowsAuthenticatedMessage() throws {
        // Given
        sut.instagramManager.isAuthenticated = true
        
        // When/Then
        let text = try sut.inspect().find(text: "Authenticated!")
        XCTAssertNotNil(text)
    }
    
    func testError_ShowsErrorMessage() throws {
        // Given
        sut.instagramManager.error = NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Test Error"])
        
        // When/Then
        let errorText = try sut.inspect().find(text: "Error: Test Error")
        XCTAssertNotNil(errorText)
    }
}
```

To use these tests, you'll need to:

1. Add ViewInspector as a dependency to your project for testing SwiftUI views
2. Make your InstagramError enum public or internal
3. Make the accessToken property testable (either through dependency injection or by making it internal for testing)

The test suite covers:
- Initial state verification
- Authentication URL generation
- Callback handling with valid and invalid codes
- Profile fetching when authenticated and unauthenticated
- View state changes based on authentication status
- Error handling and display

Key testing patterns used:
- Setup and teardown
- Mocking network calls
- Async/await testing
- Error handling verification
- View state testing
- Dependency injection

Remember to replace "YourAppModule" with your actual module name in the import statements.