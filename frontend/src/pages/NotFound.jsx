import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <Card variant="default" className="text-center p-8 sm:p-12 max-w-md">
        <h1 className="text-4xl font-bold text-text mb-3">404</h1>
        <h2 className="text-xl font-semibold text-text mb-2">
          Page not found
        </h2>
        <p className="text-base text-text-muted mb-6 leading-relaxed">
          The page you are looking for doesn't exist or may have been moved.
        </p>
        <Button variant="primary" onClick={() => navigate("/", { replace: true })}>
          Return to Sanctuary
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
