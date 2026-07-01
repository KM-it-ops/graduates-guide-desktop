# Homebrew cask (Phase 4)

```ruby
cask "graduates-guide" do
  version "0.1.0"
  sha256 :no_check

  url "https://github.com/YOUR_ORG/graduates-guide-desktop/releases/download/v#{version}/Graduates-Guide_#{version}_aarch64.dmg"
  name "The Graduate's Guide"
  desc "Privacy-first local job hunt cockpit"
  homepage "https://github.com/YOUR_ORG/graduates-guide-desktop"

  app "The Graduate's Guide.app"

  zap trash: [
    "~/Library/Application Support/guide.graduates.desktop",
    "~/Library/Preferences/guide.graduates.desktop.plist",
  ]
end
```

Replace `YOUR_ORG` and sha256 after first signed release.
