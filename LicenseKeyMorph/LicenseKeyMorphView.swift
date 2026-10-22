import SwiftUI

// MARK: - License Key Morphing Button

struct LicenseKeyMorphView: View {
    @State private var isExpanded: Bool = false
    @State private var licenseKey: String = ""
    @State private var isActivating: Bool = false
    @State private var isSuccess: Bool = false
    @FocusState private var isFocused: Bool
    
    // Physics spring configuration for smooth expansion
    private let morphSpring: Animation = .spring(
        response: 0.38,
        dampingFraction: 0.72,
        blendDuration: 0.1
    )
    
    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // Morphing Container
                HStack(spacing: 12) {
                    if !isExpanded {
                        // MARK: Collapsed State Button
                        Button {
                            withAnimation(morphSpring) {
                                isExpanded = true
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                                isFocused = true
                            }
                        } label: {
                            Text("I have a License Key")
                                .font(.custom("PlusJakartaSans-SemiBold", size: 16))
                                .foregroundStyle(Color.black)
                                .padding(.horizontal, 32)
                                .padding(.vertical, 16)
                                .contentShape(Capsule())
                        }
                        .buttonStyle(.plain)
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .scale(scale: 0.9)),
                            removal: .opacity.combined(with: .scale(scale: 0.85))
                        ))
                    } else {
                        // MARK: Expanded State (Text Field + Activate Button)
                        HStack(spacing: 8) {
                            // Text Input
                            TextField("", text: $licenseKey, prompt: Text("License Key").foregroundColor(Color.gray.opacity(0.8)))
                                .font(.custom("PlusJakartaSans-Medium", size: 16))
                                .focused($isFocused)
                                .textInputAutocapitalization(.characters)
                                .disableAutocorrection(true)
                                .padding(.leading, 18)
                                .frame(height: 52)
                            
                            // Action Button ("Activate" / Spinner / Checkmark)
                            Button {
                                handleActivate()
                            } label: {
                                HStack(spacing: 6) {
                                    if isActivating {
                                        ProgressView()
                                            .tint(.white)
                                            .scaleEffect(0.8)
                                    } else if isSuccess {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 13, weight: .bold))
                                        Text("Activated")
                                            .font(.custom("PlusJakartaSans-Bold", size: 15))
                                    } else {
                                        Text("Activate")
                                            .font(.custom("PlusJakartaSans-Bold", size: 15))
                                    }
                                }
                                .foregroundStyle(.white)
                                .padding(.horizontal, isSuccess ? 18 : 22)
                                .frame(height: 42)
                                .background(
                                    Capsule()
                                        .fill(isSuccess ? Color(red: 16/255, green: 185/255, blue: 129/255) : Color.black)
                                )
                            }
                            .buttonStyle(.plain)
                            .padding(.trailing, 6)
                            .transition(.scale(scale: 0.7).combined(with: .opacity))
                        }
                        .frame(width: 350)
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .scale(scale: 0.95)),
                            removal: .opacity.combined(with: .scale(scale: 0.9))
                        ))
                    }
                }
                .background(
                    Capsule()
                        .fill(Color(white: 0.95))
                )
                .animation(morphSpring, value: isExpanded)
                .animation(morphSpring, value: isSuccess)
                
                // Helper toggle to reset / collapse for demo
                if isExpanded {
                    Button("Cancel") {
                        isFocused = false
                        withAnimation(morphSpring) {
                            isExpanded = false
                            licenseKey = ""
                            isSuccess = false
                            isActivating = false
                        }
                    }
                    .font(.custom("PlusJakartaSans-Medium", size: 14))
                    .foregroundStyle(Color.gray)
                    .transition(.opacity)
                }
            }
        }
    }
    
    private func handleActivate() {
        if licenseKey.trimmingCharacters(in: .whitespaces).isEmpty {
            licenseKey = "PRO-8492-NX"
        }
        isFocused = false
        withAnimation {
            isActivating = true
        }
        
        // Simulated activation delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.72)) {
                isActivating = false
                isSuccess = true
            }
            
            // Auto collapse back after successful confirmation
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
                withAnimation(morphSpring) {
                    isExpanded = false
                    licenseKey = ""
                    isSuccess = false
                    isActivating = false
                }
            }
        }
    }
}

#Preview {
    LicenseKeyMorphView()
}
