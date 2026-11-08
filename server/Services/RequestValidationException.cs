namespace MapServer.Services;

/// <summary>
/// Thrown when a request is well-formed JSON but breaks a business rule
/// (bad coordinates, unknown symbol, invalid id, ...). Translated to HTTP 400.
/// </summary>
public sealed class RequestValidationException : Exception
{
    /// <summary>Creates the exception with a message that is safe to show to the user.</summary>
    public RequestValidationException(string message) : base(message)
    {
    }
}
