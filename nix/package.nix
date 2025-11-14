# Nix package definition for Nixite

{ lib
, stdenv
, fetchFromGitHub
, python3
, nodejs
, makeWrapper
}:

stdenv.mkDerivation rec {
  pname = "nixite";
  version = "2.0.0";

  src = fetchFromGitHub {
    owner = "Luminous-Dynamics";
    repo = "nixite";
    rev = "v${version}";
    sha256 = ""; # Update this with actual hash
  };

  nativeBuildInputs = [ makeWrapper ];

  buildInputs = [ python3 nodejs ];

  installPhase = ''
    runHook preInstall

    mkdir -p $out/share/nixite

    # Copy application files
    cp -r * $out/share/nixite/

    # Make start script executable
    chmod +x $out/share/nixite/start.sh

    # Create wrapper script
    mkdir -p $out/bin
    makeWrapper $out/share/nixite/start.sh $out/bin/nixite \
      --prefix PATH : ${lib.makeBinPath [ python3 nodejs ]}

    runHook postInstall
  '';

  meta = with lib; {
    description = "Visual Package Discovery for NixOS";
    longDescription = ''
      Nixite makes NixOS accessible to everyone through intuitive visual
      package discovery, powered by AI. Browse packages by purpose, use
      voice control, and install with one click.
    '';
    homepage = "https://nixite.luminousdynamics.org";
    license = licenses.mit;
    maintainers = with maintainers; [ ];
    platforms = platforms.linux;
    mainProgram = "nixite";
  };
}
