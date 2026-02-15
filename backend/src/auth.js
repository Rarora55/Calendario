import jwt from "jsonwebtoken";

export function issueAppAccessToken(user, secret, expiresIn) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    secret,
    {
      issuer: "calendario-auth-backend",
      audience: "calendario-app",
      expiresIn,
    }
  );
}

export function requireAuth(secret) {
  return (req, res, next) => {
    const authorization = req.header("authorization") ?? "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];

    if (!token) {
      res.status(401).json({ error: "Missing bearer token" });
      return;
    }

    try {
      const decoded = jwt.verify(token, secret, {
        issuer: "calendario-auth-backend",
        audience: "calendario-app",
      });

      req.user = {
        id: String(decoded.sub),
        email: typeof decoded.email === "string" ? decoded.email : "",
        name: typeof decoded.name === "string" ? decoded.name : "",
      };
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

export function requireSameUserParam(paramName) {
  return (req, res, next) => {
    const requestedUserId = req.params[paramName];
    if (!req.user?.id || !requestedUserId || req.user.id !== requestedUserId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
