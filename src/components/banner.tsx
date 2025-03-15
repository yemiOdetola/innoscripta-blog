import Container from "./container";

export default function Banner() {
  return (
    <div className="bg-gray-100 w-full min-h-[400px] flex flex-col justify-center">
      <Container>
        <h1 className="text-2xl font-bold">Untitled News</h1>
        <p className="text-gray-600">
          Get the latest news from around the world in one place
        </p>
      </Container>
    </div>
  );
};
