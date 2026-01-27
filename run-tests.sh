#!/bin/bash
# run-tests.sh - Helper script to run Playwright tests in WSL

set -e

cd "$(dirname "$0")"

echo "🧪 Playwright Test Runner"
echo "=========================="

# Kill any existing vite processes
echo "Cleaning up existing processes..."
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start dev server in background
echo "Starting dev server..."
npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 &
VITE_PID=$!

# Wait for server to be ready
echo "Waiting for server..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ Server ready on port 5173"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Server failed to start"
        cat /tmp/vite.log
        exit 1
    fi
    sleep 1
done

# Run tests
echo ""
echo "Running tests..."
TEST_OUTPUT="/tmp/playwright-$(date +%Y%m%d-%H%M%S).txt"
npx playwright test "$@" 2>&1 | tee "$TEST_OUTPUT"
TEST_EXIT=${PIPESTATUS[0]}

# Cleanup
echo ""
echo "Cleaning up..."
kill $VITE_PID 2>/dev/null || true

# Summary
echo ""
if [ $TEST_EXIT -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed (exit code: $TEST_EXIT)"
    echo "📁 Full output: $TEST_OUTPUT"
    echo "📊 HTML report: npx playwright show-report"
fi

exit $TEST_EXIT
