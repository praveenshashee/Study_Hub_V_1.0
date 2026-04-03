import { Link } from "react-router-dom";
import StatusPanel from "../components/StatusPanel.jsx";

export default function NotFoundPage() {
  return (
    <StatusPanel
      tone="error"
      title="That page does not exist"
      description="The route you opened is not part of the new React Study Hub."
      action={(
        <Link className="primary-button" to="/">
          Return home
        </Link>
      )}
    />
  );
}
