import SwiftUI

struct StepperMorphView: View {
    @State private var count: Int = 99
    @State private var isPlusPressed: Bool = false
    @State private var isMinusPressed: Bool = false
    @State private var nudgeOffset: CGFloat = 0
    
    // Snappy physics spring
    private let spring: Animation = .spring(response: 0.28, dampingFraction: 0.78)
    
    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // Stepper Capsule
                HStack(spacing: 0) {
                    // Minus Button
                    Button {
                        decrement()
                    } label: {
                        ZStack {
                            Circle()
                                .fill(Color(hex: "F0F1F7"))
                                .frame(width: 52, height: 52)
                                .scaleEffect(isMinusPressed ? 0.86 : 1.0)
                            
                            RoundedRectangle(cornerRadius: 1.5)
                                .fill(Color(hex: "1E2025"))
                                .frame(width: 16, height: 3)
                        }
                    }
                    .buttonStyle(.plain)
                    
                    Spacer()
                    
                    // Animated Digit Display
                    Text("\(count)")
                        .font(.custom("PlusJakartaSans-Bold", size: 32))
                        .foregroundColor(Color(hex: "1A1A1C"))
                        .tracking(-0.8)
                        .contentTransition(.numericText(value: Double(count)))
                        .animation(spring, value: count)
                    
                    Spacer()
                    
                    // Plus Button
                    Button {
                        increment()
                    } label: {
                        ZStack {
                            Circle()
                                .fill(Color(hex: "F0F1F7"))
                                .frame(width: 52, height: 52)
                                .scaleEffect(isPlusPressed ? 0.86 : 1.0)
                            
                            Image(systemName: "plus")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(Color(hex: "1E2025"))
                        }
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 8)
                .frame(width: 218, height: 68)
                .background(
                    Capsule()
                        .fill(Color.white)
                        .shadow(color: Color.black.opacity(0.06), radius: 12, x: 0, y: 4)
                        .overlay(
                            Capsule()
                                .stroke(Color(hex: "EEF0F4"), lineWidth: 1.5)
                        )
                )
                .offset(x: nudgeOffset)
                
                Text("Interactive Stepper Capsule")
                    .font(.custom("PlusJakartaSans-Medium", size: 13))
                    .foregroundColor(Color.gray.opacity(0.8))
            }
        }
    }
    
    private func increment() {
        withAnimation(spring) {
            count += 1
            nudgeOffset = 3
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) {
            withAnimation(spring) {
                nudgeOffset = 0
            }
        }
    }
    
    private func decrement() {
        guard count > 0 else { return }
        withAnimation(spring) {
            count -= 1
            nudgeOffset = -3
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) {
            withAnimation(spring) {
                nudgeOffset = 0
            }
        }
    }
}

#Preview {
    StepperMorphView()
}
