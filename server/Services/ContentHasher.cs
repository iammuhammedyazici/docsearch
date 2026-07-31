using System.Security.Cryptography;

namespace DocSearch.Api.Services;

public static class ContentHasher
{
    public static string ComputeSha256Hex(byte[] content) =>
        Convert.ToHexString(SHA256.HashData(content)).ToLowerInvariant();
}
