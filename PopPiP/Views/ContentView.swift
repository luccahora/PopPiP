import SafariServices
import SwiftUI

struct ContentView: View {
    @State private var extensionEnabled = false
    @Environment(\.openURL) private var openURL

    private let extensionIdentifier = "com.poppip.PopPiP.Extension"

    var body: some View {
        VStack(spacing: 22) {
            Image(systemName: "pip")
                .font(.system(size: 56, weight: .light))
                .foregroundStyle(.tint)
                .accessibilityHidden(true)

            VStack(spacing: 6) {
                Text("PopPiP").font(.largeTitle.bold())
                Text("Automatic Picture-in-Picture for Safari")
                    .foregroundStyle(.secondary)
            }

            GroupBox {
                HStack(spacing: 12) {
                    Image(systemName: extensionEnabled ? "checkmark.circle.fill" : "exclamationmark.circle")
                        .foregroundStyle(extensionEnabled ? .green : .orange)
                    VStack(alignment: .leading, spacing: 3) {
                        Text(extensionEnabled ? "Safari extension is enabled" : "Enable the Safari extension")
                            .fontWeight(.semibold)
                        Text("Open Safari Settings, choose Extensions, then enable PopPiP and grant access only to the websites you choose.")
                            .font(.callout).foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .padding(5)
            }

            HStack {
                Button("Open Safari Extension Settings") {
                    SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionIdentifier)
                }
                .buttonStyle(.borderedProminent)
                .keyboardShortcut(.defaultAction)

                Button("Privacy") { openURL(URL(string: "https://github.com/poppip-app/PopPiP/blob/main/PRIVACY.md")!) }
                Button("GitHub & Support") { openURL(URL(string: "https://github.com/poppip-app/PopPiP")!) }
            }

            Text("No accounts. No analytics. No background network requests.")
                .font(.footnote).foregroundStyle(.secondary)

            Text("Version \(PopPiPVersion.displayVersion(from: Bundle.main.infoDictionary ?? [:]))")
                .font(.caption).foregroundStyle(.tertiary)
        }
        .padding(34)
        .task { refreshExtensionState() }
    }

    private func refreshExtensionState() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionIdentifier) { state, _ in
            DispatchQueue.main.async { extensionEnabled = state?.isEnabled ?? false }
        }
    }
}

