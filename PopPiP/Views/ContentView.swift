import SafariServices
import SwiftUI

struct ContentView: View {
    @State private var extensionEnabled = false
    @Environment(\.openURL) private var openURL
    @Environment(\.scenePhase) private var scenePhase

    private let extensionIdentifier = "com.poppip.PopPiP.Extension"

    var body: some View {
        VStack(spacing: 22) {
            Image(systemName: "pip")
                .font(.system(size: 56, weight: .light))
                .foregroundStyle(.tint)
                .accessibilityHidden(true)

            VStack(spacing: 6) {
                Text("PopPiP").font(.largeTitle.bold())
                Text("app.subtitle")
                    .foregroundStyle(.secondary)
            }

            GroupBox {
                HStack(spacing: 12) {
                    Image(systemName: extensionEnabled ? "checkmark.circle.fill" : "exclamationmark.circle")
                        .foregroundStyle(extensionEnabled ? .green : .orange)
                    VStack(alignment: .leading, spacing: 3) {
                        Text(extensionEnabled ? "app.extension.enabled" : "app.extension.disabled")
                            .fontWeight(.semibold)
                        Text("app.extension.help")
                            .font(.callout).foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .padding(5)
            }

            HStack {
                Button("app.open.safari.settings") {
                    SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionIdentifier)
                }
                .buttonStyle(.borderedProminent)
                .keyboardShortcut(.defaultAction)

                Button("app.privacy") { openURL(URL(string: "https://github.com/poppip-app/PopPiP/blob/main/PRIVACY.md")!) }
                Button("app.support") { openURL(URL(string: "https://github.com/poppip-app/PopPiP")!) }
            }

            Text("app.no.tracking")
                .font(.footnote).foregroundStyle(.secondary)

            Text(String(format: NSLocalizedString("app.version.label", comment: ""), PopPiPVersion.displayVersion(from: Bundle.main.infoDictionary ?? [:])))
                .font(.caption).foregroundStyle(.tertiary)
        }
        .padding(34)
        .task { refreshExtensionState() }
        .onChange(of: scenePhase) { phase in
            if phase == .active {
                refreshExtensionState()
            }
        }
    }

    private func refreshExtensionState() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionIdentifier) { state, _ in
            DispatchQueue.main.async { extensionEnabled = state?.isEnabled ?? false }
        }
    }
}

