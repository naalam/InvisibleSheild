# ImageDefender 2
A local-first upgrade of the supplied ImageDefender. Repeated, randomized visible attribution, local logo selection, per-export-pattern UUIDs, PNG export, encrypted local signing keys, and browser verification. Original AGPL license retained. No external dependencies for the app or signer.

## Run
Requires Python 3 for the server and Node.js 18+ for signing.

```bash
cd image-defender-v2
python3 -m http.server 8000 --bind 127.0.0.1
```
Open http://localhost:8000. Use localhost for Web Crypto verification. Images are processed in memory; there is no upload endpoint, analytics, or remote asset fetching. Refreshing clears the current image. Recommended desktop Chrome/Edge/Firefox.

## Protect
1. Choose a PNG, JPEG, or WebP (30 MB / 24 megapixels maximum).
2. Enter attribution, choose a coverage pattern and preset; adjust opacity, size, and spacing.
3. Optionally choose a local logo. A transparent PNG works best.
4. Download the PNG. The full image ID appears in its filename. New pattern & image ID creates a new variant; setting changes retain that variant's ID. Each signature binds to exact bytes, even if variants share an ID.

## Generate signing keys once
Run from a terminal. Store keys OUTSIDE the served project folder. Never commit or distribute private.pem. Password loss prevents future signing; keep an encrypted backup. The CLI uses an environment variable to avoid putting the password in command history.

Bash:
```bash
read -rs -p 'Signing key password (16+ characters): ' IMAGEDEFENDER_KEY_PASSWORD
export IMAGEDEFENDER_KEY_PASSWORD
node signer.cjs keygen ../image-defender-private
```
PowerShell:
```powershell
$secret = Read-Host 'Signing key password (16+ characters)' -AsSecureString
$env:IMAGEDEFENDER_KEY_PASSWORD = [System.Net.NetworkCredential]::new('', $secret).Password
node signer.cjs keygen ../image-defender-private
```

## Sign an exported image
Replace IMAGE_ID with the UUID from the marked PNG filename, and provide the actual downloaded path:
```bash
node signer.cjs sign /path/to/marked-IMAGE_ID.png ../image-defender-private/private.pem IMAGE_ID
```
This creates an adjacent .manifest.json without overwriting an existing manifest. Existing-key generation also refuses to overwrite. Remove the password from the shell when finished (`unset IMAGEDEFENDER_KEY_PASSWORD` in Bash; `Remove-Item Env:IMAGEDEFENDER_KEY_PASSWORD` in PowerShell).

Distribute the PNG and manifest together. Share the public.pem through an independently trusted channel. Do not let a manifest supply its own trusted key. To verify, choose the PNG, manifest, and trusted public.pem in the app.

## Security model & limits
RSA-PSS/SHA-256 signatures authenticate exact exported bytes under the selected key. Verification does not establish copyright, true scene content, independently trusted time, or a person's identity unless that identity has been bound to the public key. A signer may sign any image; a UUID is not proof of ownership. Key compromise allows forgery; replace the trusted key out of band. No central key revocation is provided.

JPEG recompression, resizing, cropping, and screenshots fail exact-byte verification; failure alone does not prove malicious alteration. An entire authentic image plus its valid manifest can be copied and still verify. Signatures detect modifications; they do not stop edits or distribution. No hidden watermark, adversarial AI perturbation, C2PA implementation, or guaranteed AI-removal resistance is claimed. Visible coverage may discourage removal but has not been benchmarked against AI tools. The canvas interface is not a secure key vault; all signing is deliberately outside it.

Large files are limited after browser decoding; use only trusted local files. Resource limits are a usability guard, not a hardened hostile-image decoder. Full-resolution originals remain private only if you do not publish them separately.

## Reproducible validation
Run `node test.cjs` for a temporary-key test covering valid signatures, changed file bytes, wrong key, payload tampering, and overwrite refusal. Test keys and images are generated in an OS temporary directory and deleted.

Manual UI test: load an owned image, change all controls, export and reopen the PNG, sign it, and verify with its trusted key. Try another image and another public key: both must fail. Resize or recompress the file: exact verification must fail. For removal resistance, compare single/tiled/layered exports at identical opacity on the same images; record tool/model versions, crop percentages (10/25/40), JPEG quality (90/70/50), and whether attribution remains. Do not describe the app as AI-proof without evidence.

## License
GNU AGPL v3; see LICENSE. Modified source is included here. No warranty. This package retains the supplied project's licensing.
# Invisible_Sheild
